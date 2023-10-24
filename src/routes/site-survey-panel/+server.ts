import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import querystring from 'querystring';
import fs from 'fs';

const SAFETY_CULTURE_TOKEN = 'f5a8b512b90d4ea239858d63f768cdbcdb8cd83c6bd2216001ceb5f20a35632c'

const templates = {
    'PV, Battery and EV Survey - Testing': 'template_c8a5e85ccaf948358be9c7854aed847d'
}

export async function POST({ request }) {
    try {
        const { dealId, option } = await request.json();

        const dealData = await fetchDealData(dealId);
        const customerData = getCustomerDataFrom(dealData)
        if (option === 1) {
            const inspectionRes = await createInspectionFrom(dealData)
            const inspectionResData = await inspectionRes?.json()
            return json(inspectionResData)
        } else if (option === 2) {
            // attach PDF
            const pdfRes = await attachPDFToDeal(dealData)
            const pdfResData = await pdfRes?.json()
            return json(pdfResData)
        } else if (option ===3 ){
            // update custom field on Pipedrive
            const updateRes = await updateCustomFieldFrom(dealData)
            const updateResData = await updateRes?.json()
        } else {
            // Get status of survey
            const statusRes = await getStatusFromInspection(dealData)
            const statusResData = await statusRes?.json()
            return json(statusResData)
        }
    } catch (error) {
        console.log('Error:', error);
        return json({ error: "Can't get dealData" })
    }
}

async function fetchDealData(dealId) {
    try {
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);

        if (requestDeal.success) {
            const dealData = requestDeal.data
            return dealData;
        } else {
            console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// PL Number
// Customer Name
// Property Address
function getCustomerDataFrom(dealData) {
    const customerData = {
        pl_number: readCustomDealField('PL Number', dealData),
        person_name: dealData.person_name,
        property_address: readCustomDealField('Address of Property', dealData)
    }
    return customerData
}

const sectionsMapping = {
    'PL Number': '866ec171-9b09-40af-86f1-4dc20fbf2b75',
    'Customer Name': '3f38c167-5a2b-40a5-aa88-329886e7a5ef',
    'Property Address': '7288b6ad-d800-410e-94bb-f52c92fcbf5f',
    'MPAN': '047b6bc5-f478-44d4-bf12-91fc51f560a9',
    'Estimated Electricity Usage Per Year': 'cadce879-b36a-436a-b65f-201b5c99e710',
}

async function createInspectionFrom(dealData) {
    const customerData = getCustomerDataFrom(dealData)

    // Populate PL Number, Customer Name, Property Address
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`
        },
        body: JSON.stringify({
            template_id: 'template_c8a5e85ccaf948358be9c7854aed847d',
            header_items: [
                {
                    type: 'text',
                    responses: { text: customerData.pl_number },
                    item_id: '866ec171-9b09-40af-86f1-4dc20fbf2b75'
                },
                {
                    type: 'text',
                    responses: { text: customerData.person_name },
                    item_id: '3f38c167-5a2b-40a5-aa88-329886e7a5ef'
                },
                {
                    type: 'text',
                    responses: { text: customerData.property_address },
                    item_id: '7288b6ad-d800-410e-94bb-f52c92fcbf5f'
                }
            ]
        })
    }
    try {
        const response = await fetch('https://api.safetyculture.io/audits', options)
        return json({ message: 'Survey generated.', statusCode: 200 })
    } catch (error) {
        console.log('Error starting inspection with deal data', error)
        return json({ message: 'Error starting inspection with deal data', statusCode: 500 })
    }

}

//https://developer.safetyculture.com/reference/answerservice_getanswersforinspection
async function getInspectionDataFrom(dealData) {
    const targetInspectionId = await searchForInspectionFrom(dealData)
    if (targetInspectionId === null) {
        return null
    } else {
        const response = await fetch(`https://api.safetyculture.io/audits/${targetInspectionId}`, {
            headers: {
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        const responseData = await response.json()
        return responseData
    }
}

async function getInspectionAnswersFrom(dealData) {
    const targetInspectionId = await searchForInspectionFrom(dealData)
    if (targetInspectionId === null) {
        return null
    } else {
        const response = await fetch(`https://api.safetyculture.io/inspections/v1/answers/${targetInspectionId}`, {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        
        const responseData = await response.text()
        return responseData
    }
}

async function getStatusFromInspection(dealData) {
    const inspectionData = await getInspectionDataFrom(dealData)
    if (inspectionData) {
        let status = null
        //console.log("Data Response", inspectionData)
        if (inspectionData.audit_data.date_completed) {
            status = "Completed"
        } else status = "Not Completed"
        console.log(status)
        return json({ message: status, statusCode: 200 })
    } else return json({ message: 'Not Found', statusCode: 500 })
}

async function attachPDFToDeal(dealData) {
    //Find the specific inspection that matches the PL Number || Customer Name
    //Generate PDF to that inspection 
    const targetInspectionId = await searchForInspectionFrom(dealData)
    console.log(targetInspectionId)
    if (targetInspectionId === null) {
        // If no site survey is found
        return json({ message: 'Fail to locate an existing site survey.', statusCode: 500 })
    } else {
        const pdfLink = await exportInspectionAsPDF(targetInspectionId[0])
        const pdFilesApi = new pipedrive.FilesApi(pd);
        const addFileRequest = await pdFilesApi.addFile('./static/site_survey.pdf', { 'dealId': dealData.id })
        return json({ message: 'PDF succesfully attached to deal.', statusCode: 200 })
    }
}

//Search for a first matching inspection that has a matching PL number in the title
async function searchForInspectionFrom(dealData) {
    const customerData = getCustomerDataFrom(dealData)

    const response = await fetch(`https://api.safetyculture.io/audits/search?template=template_c8a5e85ccaf948358be9c7854aed847d&archived=false&completed=both`, {
        headers: {
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        }
    })
    const responseData = await response.json()
    const auditList = responseData.audits
    //customerData.pl_number = 'pl001224'
    //Loop through each audits_data, and find which matches
    let found = false
    let targetInspection = []
    if (found === false) {
        for (const i in auditList) {
            const audit_id = auditList[i].audit_id
            const response = await fetch(`https://api.safetyculture.io/audits/${audit_id}`, {
                headers: {
                    'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
                }
            })
            const responseData = await response.json()
            const surveyTitle = responseData.audit_data.name

            //Matches
            if (surveyTitle.toLowerCase().includes(customerData.pl_number.toLowerCase())) {
                console.log(surveyTitle)
                found = true
                targetInspection.push(audit_id)
                return targetInspection
            }
        }
    }
    return null
}

async function exportInspectionAsPDF(inspection_id) {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        },
        body: JSON.stringify({
            type: 'DOCUMENT_TYPE_PDF',
            export_data: [
                {
                    inspection_id: inspection_id,
                }
            ]
        })
    }
    const response = await fetch('https://api.safetyculture.io/inspection/v1/export', options)
    const responseData = await response.json() // returns PDF download link

    const pdfResponse = await fetch(responseData.url) // Make HTTP request to download the file

    // Convert readable stream to buffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(pdfArrayBuffer));

    const filePath = './static/site_survey.pdf'; // creates temporary PDF
    fs.writeFileSync(filePath, buffer);

    return responseData.url
}

async function updateCustomFieldFrom(dealData) {
    const inspectionAnswers = await getInspectionAnswersFrom(dealData)
    
    if (inspectionAnswers) {
        
        return json({ message: 'Custom field updated.', statusCode: 200 })
    } else return json({ message: 'Not Found', statusCode: 500 })
}
import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd, readCustomDealField, dealFieldsRequest, getKeysForCustomFields } from '../../lib/pipedrive-utils.js';
import fs from 'fs';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';
import pkg from 'really-relaxed-json';
const { toJson } = pkg;

const companyDomainFields = 'https://api.pipedrive.com/v1/deals/'

const SAFETY_CULTURE_TOKEN = 'f5a8b512b90d4ea239858d63f768cdbcdb8cd83c6bd2216001ceb5f20a35632c'

const templates = {
    'PV, Battery and EV Survey - Testing': 'template_c8a5e85ccaf948358be9c7854aed847d'
}

export async function POST({ request }) {
    try {
        const { dealId, option } = await request.json();
        const dealData = await fetchDealData(dealId);
        const customerData = getCustomerDataFrom(dealData);

        let response;

        if (option === 1) {
            response = await createInspectionFrom(dealData);
        } else if (option === 2) {
            response = await attachPDFToDeal(dealData);
        } else if (option === 3) {
            response = await updateMPAN(dealData);
        } else {
            response = await getStatusFromInspection(dealData);
        }

        const responseData = await response?.json();
        return json(responseData);
    } catch (error) {
        console.log('Error:', error);
        return json({ message: "Can't get dealData", statusCode: 500 });
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
//WIP
async function getInspectionAnswersFrom(dealData) {
    const targetInspectionId = await searchForInspectionFrom(dealData)
    if (targetInspectionId === null) {
        return null
    } else {
        const response = await fetch(`https://api.safetyculture.io/inspections/v1/answers/${targetInspectionId}`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        const responseData = await response.text()

        //Parsing to array of JSONs
        let parsedResponse = "[" + responseData + "]"
        parsedResponse = JSON.parse(toJson(parsedResponse))

        return parsedResponse
    }
}

async function getInspectionSingleAnswerFrom(dealData, question_id) {
    const targetInspectionId = await searchForInspectionFrom(dealData)
    if (targetInspectionId === null) {
        return null
    } else {
        const response = await fetch(`https://api.safetyculture.io/inspections/v1/answers/${targetInspectionId}`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        const responseData = await response.text()

        //Parsing to array of JSONs
        let parsedResponse = "[" + responseData + "]"
        parsedResponse = JSON.parse(toJson(parsedResponse))
        for (const i in parsedResponse) {
            if (parsedResponse[i].result.question_id === question_id) {
                return parsedResponse[i].result.text_answer
            }
        }
        return null
    }
}

async function getStatusFromInspection(dealData) {
    const inspectionData = await getInspectionDataFrom(dealData)
    if (inspectionData) {
        let status = null
        //console.log("Data Response", inspectionData)
        if (inspectionData.audit_data.date_completed) {
            status = 'Completed'
        } else status = 'Not Completed'
        return json({ message: status, statusCode: 200 })
    } else return json({ message: undefined, statusCode: 500 })
}

async function attachPDFToDeal(dealData) {
    //Find the specific inspection that matches the PL Number || Customer Name
    //Generate PDF to that inspection 
    const targetInspectionId = await searchForInspectionFrom(dealData)
    if (targetInspectionId === null) {
        // If no site survey is found
        return json({ message: 'Fail to locate an existing site survey.', statusCode: 500 })
    } else {
        const pdfLink = await exportInspectionAsPDF(targetInspectionId[0])
        const pdFilesApi = new pipedrive.FilesApi(pd);
        const filePath = './pdfs/site_survey.pdf'
        const addFileRequest = await pdFilesApi.addFile(filePath, { 'dealId': dealData.id })
        fs.unlinkSync(filePath);
        return json({ message: 'PDF succesfully attached to deal.', statusCode: 200, pdfLink: pdfLink, addFileRequest: addFileRequest })
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
            const match = surveyTitle.match(/PL\d+/i);

            //Matches
            if (match[0].toLowerCase() === customerData.pl_number.toLowerCase()) {
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

    const filePath = './pdfs/site_survey.pdf'; // creates temporary PDF
    fs.writeFileSync(filePath, buffer);

    return responseData.url
}

// [fieldName]: value
let fieldsToUpdate = {
    'MPAN number': '',
}
//WIP
async function updateCustomFieldFrom(dealData) {
    const inspectionAnswers = await getInspectionAnswersFrom(dealData)

    if (inspectionAnswers) {
        /*
        const keyedData = getKeysForCustomFields(fieldsToUpdate)
        const req = {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [keyedData[0][0]]: keyedData[0][1] })
        };
        const response = await fetch(companyDomainFields + dealData.id + '?api_token=' + PIPEDRIVE_API_TOKEN, req);
        */
        return json({ message: 'Custom field updated.', statusCode: 200 })
    } else return json({ message: 'Not Found', statusCode: 500 })
}

async function updateMPAN(dealData) {
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, '047b6bc5-f478-44d4-bf12-91fc51f560a9')
    let fieldsToUpdate = {
        'MPAN number': inspectionAnswer.answer,
    }
    if (inspectionAnswer) {

        const keyedData = getKeysForCustomFields(fieldsToUpdate)
        const req = {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [keyedData[0][0]]: keyedData[0][1] })
        };
        const response = await fetch(companyDomainFields + dealData.id + '?api_token=' + PIPEDRIVE_API_TOKEN, req);
        return json({ message: 'Custom field updated.', statusCode: 200 })
    } else return json({ message: 'Not Found', statusCode: 500 })
}

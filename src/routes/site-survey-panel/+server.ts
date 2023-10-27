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
    'PV, Battery and EV Survey - Testing': 'template_c8a5e85ccaf948358be9c7854aed847d',
    'PV, Battery and EV Survey': 'template_ca68194ee1fa4fae98c923fb5e3b4edb' // new template
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
            await addNote(dealData)
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


const safetyCultureFieldsMapping = {
    'PL Reference': '2ccff49f-03fa-4ab2-a2bf-7fa948bf06eb',
    'Customer Name': 'd9930677-8f40-448d-8766-26a9ebdd55ad',
    'Property Address': '7288b6ad-d800-410e-94bb-f52c92fcbf5f',
    'Conducted on': '5e88e4da-6dfb-48e2-8ddd-925564f690aa',
    'Prepared by': 'cc609f47-fc22-4df9-b624-726421d150d5',
    'Does the customer have an existing installation?': '8e5901b1-5c04-48fb-a878-7c069e507ff5',
    'Make and model of existing inverter': '3c696419-8380-434c-85d5-8836487761e9',
    'MPAN': '047b6bc5-f478-44d4-bf12-91fc51f560a9',
    'Trenching?': null,
    'Proposed Battery Location': null,
    'Scaffolding?': null,
    'Stringing Configuration': null,
    'Azimuth, Pitch': null,
    'Anual consumption': 'cadce879-b36a-436a-b65f-201b5c99e710',
    'Shade factor': null,
    'Roof Structure Type': null,
    'Roof Type': 'e2e4d156-dc1a-4079-b1f4-826f1ea4efce',
    'Roof Tile Type': null,
    'Site Survey Status': null,
    'Additional Comments': '7d67e682-b402-41ef-bedd-a53e5292bf33'
}

const safetyCultureResponsesMapping = {
    'Roof Tile Type': {
      'rosemary': '88e5b264-45fe-4f6a-a410-fa7a5fa07372',
      'concrete': '47f9144e-ae4e-4c8b-8304-abba1f5eaa01',
      'slate': '055d6483-9e8e-4abe-9289-4ecfd7e7cc1f',
      'trapezoidal': 'e06d490f-0678-4629-8740-ae6586730744',
      'flat': '4f77c3ec-0b33-4b24-802e-91e0d5fec5f8',
      'other': 'b6f61759-5ea3-4f2d-ac48-4f19ae770271'
    }
  };

const pipeDriveFieldsToUpdate = {
    'Existing Inverter - Make/Model/Size': '66ae80e6e27e7af328cb51c2de5a6c3df2afd04a',
    'MPAN number': '75b418263a46a2ee1025fc8f87d730219484b56b',
    'Is trenching required?': '2d988809bd18aa3c93a6aa7be58bea337aed59a4',
    'Proposed battery location - request photo': 'c648ac1a374a3569a74cd39e646529152bb944b7',
    'Scaffolding Required?': '120b9ae729965a5bbce64521e8d100c1b75366a8',
    'Stringing Configuration': 'c7565066588250604677c6a9f33fbba76ea2643b',
    'Azimuth, Pitch': '1c7c3a1b307f040a89e95dab1cfe5e177e45d51f',
    'Annual consumption & Unit Rate': '8ff87ffe3025b9834523d114e8f68c03b794609f',
    'Shade factor': 'bdc33651d8e28f0ff89f054d2a6ae9cd6aa846f9',
    'Roof Structure Type': '102498b690aae6ccf74ba24764adc239c23a3aae',
    'Roof Type': '5969028bbc28e9f087522eab021d261abddf3dcf',
    'Roof Tile Type': '47692599a527f65407125f43a1a4fb2f79ad0df6',
    'Site Survey Status': 'e775d10dd3e167c96a1d7cf0a12639ad9cfc1548',
};

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

        let fieldsToUpdate = {
            'Site Survey Status': "",
        }

        if (inspectionData.audit_data.date_completed) {
            status = 'Completed'
            fieldsToUpdate['Site Survey Status'] = "1047" // 1047 is the option id for Yes
        } else {
            status = 'Not Completed'
            fieldsToUpdate['Site Survey Status'] = "1048" // 1048 is the option id for No
        }

        const keyedData = getKeysForCustomFields(fieldsToUpdate)
        // keyedData is in form of [ [ 'e775d10dd3e167c96a1d7cf0a12639ad9cfc1548', '1048' ] ]
        const customFieldKey = keyedData[0][0];
        const customFieldValue = keyedData[0][1];

        const parsedRequest = { [customFieldKey]: customFieldValue }; // request is in the form {"e775d10dd3e167c96a1d7cf0a12639ad9cfc1548":"1048"}
        const pdDealsApi = new pipedrive.DealsApi(pd)
        const updateDealRequest = await pdDealsApi.updateDeal(dealData.id, parsedRequest)

        return json({ message: status, statusCode: 200 })
    }
    else return json({ message: undefined, statusCode: 500 })
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
        const filePath = '/tmp/site_survey.pdf'
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
            return audit_id
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

    const filePath = '/tmp/site_survey.pdf'; // creates temporary PDF
    fs.writeFileSync(filePath, buffer);

    return responseData.url
}

// [fieldName]: value
let fieldsToUpdate = {
    'MPAN number': '',
}
// WIP for updating multiple custom field in later version 
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
        const keyedData = getKeysForCustomFields(fieldsToUpdate) // returns the mapping of custom field key 
        const customFieldKey = keyedData[0][0];
        const customFieldValue = keyedData[0][1];

        const parsedRequest = { [customFieldKey]: customFieldValue };  // request is in the form {"e775d10dd3e167c96a1d7cf0a12639ad9cfc1548":"1048"}
        const pdDealsApi = new pipedrive.DealsApi(pd)
        const updateDealRequest = await pdDealsApi.updateDeal(dealData.id, parsedRequest)
        return json({ message: 'Custom field updated.', statusCode: 200 })
    } else return json({ message: 'Not Found', statusCode: 500 })
}

async function addNote(dealData) {
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, 'e54cd46a-d8cb-4a2e-9190-2a6efd69dcbf')

    const noteRequest = {
        dealId: dealData.id,
        content: inspectionAnswer.answer
    };

    const noteApi = new pipedrive.NotesApi(pd);
    const newNote = await noteApi.addNote(noteRequest);
    return newNote
}



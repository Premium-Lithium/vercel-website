import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd, readCustomDealField, dealFieldsRequest, getKeysForCustomFields, getField, getOptionIdFor } from '../../lib/pipedrive-utils.js';
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
            response = await createInspectionFrom(dealData, 'PV, Battery and EV Survey');
        } else if (option === 2) {
            response = await attachPDFToDeal(dealData);
        } else if (option === 3) {
            response = await updateCustomFieldsFrom(dealData);
            await addNote(dealData)
        } else {
            response = await getStatusFromInspection(dealData);
        }

        const responseData = await response?.json();
        return json(responseData);
    } catch (error) {
        console.log('Error:', error);
        return json({ message: "Internal server error", statusCode: 500 });
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


const safetyCultureFieldsToUpdateMapping = {
    'PL Reference': '2ccff49f-03fa-4ab2-a2bf-7fa948bf06eb',
    'Customer Name': 'd9930677-8f40-448d-8766-26a9ebdd55ad',
    'Property Address': '7288b6ad-d800-410e-94bb-f52c92fcbf5f',
    'Conducted on': '5e88e4da-6dfb-48e2-8ddd-925564f690aa',
}

//https://developer.safetyculture.com/reference/templatesservice_gettemplatebyinspectionid
const safetyCultureFieldsToRetrieveMapping = {
    'Make and model of existing inverter': '3c696419-8380-434c-85d5-8836487761e9',
    'MPAN': '047b6bc5-f478-44d4-bf12-91fc51f560a9',
    'Scaffolding?': '76fb0ffe-3e3d-45d9-9554-78e229ff112e',
    'Roof Type': 'e2e4d156-dc1a-4079-b1f4-826f1ea4efce',
    //'Additional Comments': '7d67e682-b402-41ef-bedd-a53e5292bf33',
    'Roof Pitch': '530917c3-ac73-49d6-b3b0-9b73c75ef3ab',
    'Roof orientation from south': '22bd6c9b-5802-4b1e-9b53-12fc3f6d4012',
    'Is it a truss roof?': '1e5da9a2-11aa-4e33-9d48-00ce2880f1ed',
}

// TO - DO create mapping between pipedrive options field and safetyculture response answer
const pipeDriveSafetyCultureOptionMapping = {
    // PIPEDRIVE CUSTOM FIELD KEY : SAFETYCULTURE QUESTIONS ID
    '66ae80e6e27e7af328cb51c2de5a6c3df2afd04a': '3c696419-8380-434c-85d5-8836487761e9', // Existing Inverter - Make/Model/Size 
    '75b418263a46a2ee1025fc8f87d730219484b56b': '047b6bc5-f478-44d4-bf12-91fc51f560a9', // MPAN
    '47692599a527f65407125f43a1a4fb2f79ad0df6': 'e2e4d156-dc1a-4079-b1f4-826f1ea4efce', // Roof Tile Type 
    '120b9ae729965a5bbce64521e8d100c1b75366a8': '76fb0ffe-3e3d-45d9-9554-78e229ff112e', // Is scaffolding required?
    '102498b690aae6ccf74ba24764adc239c23a3aae': '1e5da9a2-11aa-4e33-9d48-00ce2880f1ed', // Roof structure type / is it a truss roof?
    '2784a6bfc692ef55a36ec269500bc196a6aa9f2d': '530917c3-ac73-49d6-b3b0-9b73c75ef3ab', // Pitch / Roof Pitch
    '1c7c3a1b307f040a89e95dab1cfe5e177e45d51f': '22bd6c9b-5802-4b1e-9b53-12fc3f6d4012', // Azimuth / Roof orientation from south

    // PIPEDRIVE CUSTOM FIELD OPTIONS ID : SAFETYCULTURE RESPONSES ID
    823: '8fadf2e2-4cee-4efe-ae29-3ed4e8ee954c', // Scaffolding Required - 1 SIDE - 1 FLOOR
    824: '6470c37e-0703-489e-8ce0-0608fbdc5fe1', // Scaffolding Required - 1 SIDE - 2 FLOOR
    1033: '9fcb11e1-713b-4e54-875f-c47eac114c4b', // Scaffolding Required - 1 SIDE - 3 FLOOR
    1034: '2576b336-95c7-4b66-b605-fa73414e5fe6', // Scaffolding Required - 2 SIDE - 1 FLOOR
    1035: '95d5f388-f72c-4026-b678-c137a23e2fb5', // Scaffolding Required - 2 SIDE - 2 FLOOR
    1036: '98a8954c-0843-46d4-baee-771b302fdc61', // Scaffolding Required - 2 SIDE - 3 FLOOR
    1037: '07aa0d81-e099-4565-adfc-b7da5508d37d', // Scaffolding Required - 3 SIDE - 1 FLOOR
    1038: 'dd392ea7-cdb2-4e2a-beb0-6e0b0fe472da', // Scaffolding Required - 3 SIDE - 2 FLOOR
    1039: '2c6f72bb-7b17-4419-8de3-eb5a83af816e', // Scaffolding Required - 3 SIDE - 3 FLOOR
    1023: '47f9144e-ae4e-4c8b-8304-abba1f5eaa01', // Roof Tile Type - Concrete
    1024: '88e5b264-45fe-4f6a-a410-fa7a5fa07372', // Roof Tile Type - Rosemary
    1025: '055d6483-9e8e-4abe-9289-4ecfd7e7cc1f', // Roof Tile Type - Slate
    1026: 'be2a5ac6-c9cd-46ec-847f-bf7f8c96c5f3', // Roof Tile Type - Yorkshire stone
    1027: 'e06d490f-0678-4629-8740-ae6586730744', // Roof Tile Type - Trapezoidal
    1028: 'f23275eb-6099-414b-ac99-0a0e746ee09e', // Roof Tile Type - Felted
    1059: '6d554cfa-0e32-4d03-b09c-965b7ea152f6', // Roof Tile Type - Ground Mount
    1060: '4f77c3ec-0b33-4b24-802e-91e0d5fec5f8', // Roof Tile Type - Flat
    1029: 'b6f61759-5ea3-4f2d-ac48-4f19ae770271', // Roof Tile Type - Other
    1030: '8ffd7a5e-5957-4be8-be49-ea1a46eddc80', // Roof Structure Type - Traditional
    1031: '60f61b2d-88a3-47a8-8588-463c1066efce', // Roof Structure Type - Trussed
    1032: 'a29bdcb4-4d38-47ac-8b74-1a9ec1fa2402', // Roof Structure Type - Other
}

async function createInspectionFrom(dealData, templateName) {
    const customerData = getCustomerDataFrom(dealData)

    // Populate PL Number, Customer Name, Property Address
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`
        },
        body: JSON.stringify({
            template_id: templates[templateName],
            header_items: [
                {
                    type: 'text',
                    responses: { text: customerData.pl_number },
                    item_id: '2ccff49f-03fa-4ab2-a2bf-7fa948bf06eb'
                },
                {
                    type: 'text',
                    responses: { text: customerData.person_name },
                    item_id: 'd9930677-8f40-448d-8766-26a9ebdd55ad'
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
    const targetInspectionId = await searchForInspectionFrom(dealData, 'PV, Battery and EV Survey')
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
    const targetInspectionId = await searchForInspectionFrom(dealData, 'PV, Battery and EV Survey')
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
        let responseObject = JSON.parse(toJson(parsedResponse))

        const searchQuestionIds = Object.values(safetyCultureFieldsToRetrieveMapping)
        const foundResults = responseObject.filter(item => searchQuestionIds.includes(item.result.question_id));
        // returns an object of {questionId : answer}
        let answerObject = {};
        for (let i in foundResults) {
            if ('text_answer' in foundResults[i].result) {
                answerObject[foundResults[i].result.question_id] = foundResults[i].result.text_answer.answer
            } else if ('list_answer' in foundResults[i].result) {
                answerObject[foundResults[i].result.question_id] = foundResults[i].result.list_answer.responses
            } else if ('question_answer' in foundResults[i].result) {
                answerObject[foundResults[i].result.question_id] = foundResults[i].result.question_answer.responses
            }
        }
        return answerObject
    }
}

// If answer is Text, return raw text,
// If answer is a response Object, return an array of the response ID
async function getInspectionSingleAnswerFrom(dealData, question_id) {
    const targetInspectionId = await searchForInspectionFrom(dealData, 'PV, Battery and EV Survey')
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
        let responseObject = JSON.parse(toJson(parsedResponse))

        const foundResult = responseObject.find(item => item.result.question_id === question_id);
        // Return the response option if answer is a list type & return string answer if its a text type
        // Return null if empty string
        if ('list_answer' in foundResult.result) {
            return foundResult.result.list_answer.responses;
        } else if ('question_answer' in foundResult.result) {
            return foundResult.result.question_answer.responses;
        } else if (foundResult.result.text_answer.answer === "") {
            return null;
        } else {
            return foundResult.result.text_answer.answer;
        }
    }
}

function getKeyByValue(obj, value) {
    return Object.keys(obj)
        .filter(key => obj[key] === value);
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
            fieldsToUpdate['Site Survey Status'] = status // 1047 is the option id for Yes
        } else {
            status = 'Not Completed'
            fieldsToUpdate['Site Survey Status'] = status // 1048 is the option id for No
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
    const targetInspectionId = await searchForInspectionFrom(dealData, 'PV, Battery and EV Survey')
    if (targetInspectionId === null) {
        // If no site survey is found
        return json({ message: 'Fail to locate an existing site survey.', statusCode: 500 })
    } else {
        const pdfLink = await exportInspectionAsPDF(targetInspectionId)
        const pdFilesApi = new pipedrive.FilesApi(pd);
        const filePath = '/tmp/site_survey.pdf'
        const addFileRequest = await pdFilesApi.addFile(filePath, { 'dealId': dealData.id })
        fs.unlinkSync(filePath);
        return json({ message: 'PDF succesfully attached to deal.', statusCode: 200, pdfLink: pdfLink, addFileRequest: addFileRequest })
    }
}

//Search for a first matching inspection that has a matching PL number in the title
async function searchForInspectionFrom(dealData, templateName) {
    const templateId = templates[templateName]
    const customerData = getCustomerDataFrom(dealData)
    const response = await fetch(`https://api.safetyculture.io/audits/search?template=${templateId}&archived=false&completed=both`, {
        headers: {
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        }
    })
    const responseData = await response.json()
    const auditList = responseData.audits
    // Loop through each audits_data, and find first matches
    // Iterate from latest inspection to oldest
    for (const i in auditList.reverse()) {
        const audit_id = auditList[i].audit_id
        const response = await fetch(`https://api.safetyculture.io/audits/${audit_id}`, {
            headers: {
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        const responseData = await response.json()
        const surveyTitle = responseData.audit_data.name
        if (surveyTitle != "") {
            //Matches
            const match = surveyTitle.match(/PL\d+/i);
            if (match) {
                if (match[0].toLowerCase() === customerData.pl_number.toLowerCase()) {
                    return audit_id
                }
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
                    lang: 'en-US',
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

function mapSafetyCultureAnswersToPD(inspectionAnswers) {
    let resultObject = {}
    // Map all safety culture answers into pipedrive format
    for (const key in inspectionAnswers) {
        const value = inspectionAnswers[key]
        const getPipeDriveFieldId = getKeyByValue(pipeDriveSafetyCultureOptionMapping, key)[0]
        // If a resposne object is found, map it to its pipedrive options value
        if (typeof (value) != "string") {
            const pipeDriveOptionsId = getKeyByValue(pipeDriveSafetyCultureOptionMapping, value[0])[0]
            resultObject[getPipeDriveFieldId] = pipeDriveOptionsId
        }
        else {
            if (value.length == 0) resultObject[getPipeDriveFieldId] = null
            else resultObject[getPipeDriveFieldId] = value
        }
    }
    return resultObject
}

async function updateCustomFieldsFrom(dealData) {
    const inspectionAnswers = await getInspectionAnswersFrom(dealData)

    let resultObject = mapSafetyCultureAnswersToPD(inspectionAnswers)

    const pdDealsApi = new pipedrive.DealsApi(pd)
    const updateDealRequest = await pdDealsApi.updateDeal(dealData.id, resultObject)
    return json({ message: 'Custom field updated.', statusCode: 200 })
}

async function updateSingleCustomFieldFrom(dealData, customFieldName, question_id) {
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, question_id)

    if (inspectionAnswer) {
        let fieldsToUpdate = {
            [customFieldName]: inspectionAnswer.answer,
        }

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
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, '7d67e682-b402-41ef-bedd-a53e5292bf33')
    if (inspectionAnswer) {
        const noteRequest = {
            dealId: dealData.id,
            content: inspectionAnswer
        };

        const noteApi = new pipedrive.NotesApi(pd);
        const newNote = await noteApi.addNote(noteRequest);
        return newNote
    }
}



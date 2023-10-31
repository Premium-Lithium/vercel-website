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
            response = await updateMPAN(dealData);
            await addNote(dealData)
        } else {
            response = await getStatusFromInspection(dealData);
            //await getInspectionAnswersFrom(dealData)
            await updateCustomFieldsFrom(dealData)
            
            //const updateRes = await updateCustomFieldsFrom(dealData);
            //getInspectionAnswersFrom(deal)
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


const safetyCultureFieldsToUpdateMapping = {
    'PL Reference': '2ccff49f-03fa-4ab2-a2bf-7fa948bf06eb',
    'Customer Name': 'd9930677-8f40-448d-8766-26a9ebdd55ad',
    'Property Address': '7288b6ad-d800-410e-94bb-f52c92fcbf5f',
    'Conducted on': '5e88e4da-6dfb-48e2-8ddd-925564f690aa',
}

const safetyCultureFieldsToRetrieveMapping = {
    'Make and model of existing inverter': '3c696419-8380-434c-85d5-8836487761e9',
    'MPAN': '047b6bc5-f478-44d4-bf12-91fc51f560a9',
    'Scaffolding?': null,
    'Roof Type': 'e2e4d156-dc1a-4079-b1f4-826f1ea4efce',
    //'Additional Comments': '7d67e682-b402-41ef-bedd-a53e5292bf33',
}




// TO - DO create mapping between pipedrive options field and safetyculture response answer
//[pipedrive options id] : [safetyculture response id]
const pipeDriveSafetyCultureOptionMapping = {
    '66ae80e6e27e7af328cb51c2de5a6c3df2afd04a': '3c696419-8380-434c-85d5-8836487761e9', // Existing Inverter 
    '75b418263a46a2ee1025fc8f87d730219484b56b': '047b6bc5-f478-44d4-bf12-91fc51f560a9', // MPAN
    '47692599a527f65407125f43a1a4fb2f79ad0df6': 'e2e4d156-dc1a-4079-b1f4-826f1ea4efce', // Roof Tile Type

    // Options
    1023: '47f9144e-ae4e-4c8b-8304-abba1f5eaa01', // Concrete
    1024: '88e5b264-45fe-4f6a-a410-fa7a5fa07372', // Rosemary
    1025: '055d6483-9e8e-4abe-9289-4ecfd7e7cc1f', //Slate
    1026: '', //Yorkshire stone
    1027: 'e06d490f-0678-4629-8740-ae6586730744', //Trapezoidal
    1028: '', //Felted
    1029: 'b6f61759-5ea3-4f2d-ac48-4f19ae770271', //Other


}
const pipeDriveFieldsOptions = {
    'Is trenching required?': [{ id: 821, label: 'Yes' }, { id: 822, label: 'No' }],
    'Scaffolding Required?': [
        { id: 823, label: '1 SIDE -  1 FLOOR' },
        { id: 824, label: '1 SIDE -  2 FLOOR' },
        { id: 1033, label: '1 SIDE -  3 FLOOR' },
        { id: 1034, label: '2 SIDE -  1 FLOOR' },
        { id: 1035, label: '2 SIDE -  2 FLOOR' },
        { id: 1036, label: '2 SIDE -  3 FLOOR' },
        { id: 1037, label: '3 SIDE -  1 FLOOR' },
        { id: 1038, label: '3 SIDE -  2 FLOOR' },
        { id: 1039, label: '3 SIDE -  3 FLOOR' },
        { id: 1040, label: 'Not Required' }
    ],
    'Roof Structure Type': [
        { id: 1030, label: 'Traditional' },
        { id: 1031, label: 'Trussed' },
        { id: 1032, label: 'Other' }
    ],
    'Roof Type': [
        { id: 929, label: 'Pitched/Angled' },
        { id: 930, label: 'Flat' },
        { id: 942, label: 'Hip' },
        { id: 1022, label: 'Gable' },
        { id: 931, label: 'Unsure' }
    ],
    'Roof Tile Type': [
        { id: 1023, label: 'Concrete' },
        { id: 1024, label: 'Rosemary' },
        { id: 1025, label: 'Slate' },
        { id: 1026, label: 'Yorkshire stone' },
        { id: 1027, label: 'Trapezoidal' },
        { id: 1028, label: 'Felted' },
        { id: 1029, label: 'Other' }
    ],
    'Site Survey Status': [{ id: 1047, label: 'Yes' }, { id: 1048, label: 'No' }],

}

const pipeDriveFieldsToUpdate = {
    'Existing Inverter - Make/Model/Size': '66ae80e6e27e7af328cb51c2de5a6c3df2afd04a',
    'MPAN number': '75b418263a46a2ee1025fc8f87d730219484b56b',
    'Is trenching required?': '2d988809bd18aa3c93a6aa7be58bea337aed59a4',
    'Scaffolding Required?': '120b9ae729965a5bbce64521e8d100c1b75366a8',
    'Roof Type': '5969028bbc28e9f087522eab021d261abddf3dcf',
    'Roof Tile Type': '47692599a527f65407125f43a1a4fb2f79ad0df6',
    'Site Survey Status': 'e775d10dd3e167c96a1d7cf0a12639ad9cfc1548',
};

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
            if (foundResults[i].result.text_answer) {
                answerObject[foundResults[i].result.question_id] = foundResults[i].result.text_answer.answer
            } else {
                answerObject[foundResults[i].result.question_id] = foundResults[i].result.list_answer.responses
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
        const textAnswer = foundResult.result.text_answer
        const listAnswer = foundResult.result.list_answer.responses
        if (textAnswer) return textAnswer
        else {
            return listAnswer
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

// WIP for updating multiple custom field in later version 
async function updateCustomFieldsFrom(dealData) {
    const inspectionAnswers = await getInspectionAnswersFrom(dealData)
    console.log(inspectionAnswers)

    let resultObjectFinal = {}
    // Map all safety culture answers into pipedrive format
    for(const key in inspectionAnswers){
        const value = inspectionAnswers[key]
        const getPipeDriveFieldId = getKeyByValue(pipeDriveSafetyCultureOptionMapping, key)[0]
        // If a resposne object is found, map it to its pipedrive options value
        if(typeof(value) != "string")
        {
            const pipeDriveOptionsId = getKeyByValue(pipeDriveSafetyCultureOptionMapping, value[0])[0]
            resultObjectFinal[getPipeDriveFieldId] = pipeDriveOptionsId
        }
        else {
            resultObjectFinal[getPipeDriveFieldId] = value
        }
    }
    const pdDealsApi = new pipedrive.DealsApi(pd)
    const updateDealRequest = await pdDealsApi.updateDeal(dealData.id, resultObjectFinal)
    console.log(updateDealRequest)
    return json({ message: 'Custom field updated.', statusCode: 200 })

}

async function updateMPAN(dealData) {
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, '047b6bc5-f478-44d4-bf12-91fc51f560a9')


    if (inspectionAnswer) {
        let fieldsToUpdate = {
            'MPAN number': inspectionAnswer.answer,
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
    const inspectionAnswer = await getInspectionSingleAnswerFrom(dealData, 'e54cd46a-d8cb-4a2e-9190-2a6efd69dcbf')

    const noteRequest = {
        dealId: dealData.id,
        content: inspectionAnswer.answer
    };

    const noteApi = new pipedrive.NotesApi(pd);
    const newNote = await noteApi.addNote(noteRequest);
    return newNote
}



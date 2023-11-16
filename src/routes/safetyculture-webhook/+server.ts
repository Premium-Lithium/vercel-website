import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { SurveyDataSource } from '$lib/crm/safetyculture-utils.js';

const crm = new CRM()
const surveyDataSource = new SurveyDataSource()

// Triggers: "TRIGGER_EVENT_INSPECTION_COMPLETED"
// Receives inspection that has been completed 
export async function POST({ request }) {
    const { data } = await request.json()
    console.log(data)
    const inspectionTitle = data.audit.audit_data.name
    const inspectionTemplateId = data.audit.template_id
    const inspectionStatus = data.audit.audit_data.date_completed
    const inspectionTemplateName = await surveyDataSource.getTemplateNameFor(inspectionTemplateId)
    const PLNumber = inspectionTitle.match(/PL\d+/i)[0]

    let response;

    // Checks if inspection has actually been completed
    if(inspectionStatus) {
        if(inspectionTemplateName === 'Installation Form') {
            response = await attachPDFToDeal(PLNumber, `${PLNumber}_installation_form.pdf`, inspectionTemplateName);
        } else if (inspectionTemplateName === 'PV, Battery and EV Survey') {
            response = await updatePipedriveDealFrom(PLNumber, inspectionTemplateName);
            response = await attachPDFToDeal(PLNumber, `${PLNumber}_site_survey.pdf`, inspectionTemplateName);
        }
    }
    const responseData = await response?.json()
    return json(responseData)
}

async function attachPDFToDeal(PLNumber: string, fileName: string, templateName: string) {
    const responseData = await surveyDataSource.exportPdfFor(PLNumber, templateName)
    const pdfResponse = await fetch(responseData.url) // Make HTTP request to download the file

    // Convert readable stream to buffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(pdfArrayBuffer));

    const filePath = `/tmp/${fileName}`;
    fs.writeFileSync(filePath, buffer);

    const addFileRequest = await crm.attachPdfFor(PLNumber, filePath)
    fs.unlinkSync(filePath);
    console.log(`PDF successfully attached to the deal ${PLNumber} .`);
    return json({ message: 'PDF succesfully attached to deal.', statusCode: 200, pdfLink: responseData.url, addFileRequest: addFileRequest })
}

async function updatePipedriveDealFrom(PLNumber: string, templateName: string) {
    try {
        const fieldNames = [
            'Existing Inverter Make ',
            'Model of existing inverter ',
            'MPAN',
            'Roof Type ',
            'Roof Pitch ',
            'Roof Orientation from South ',
            'Roof Structure Type ',
            'How many side of scaffolding are required?',
            'Recommended No. of panels',
            'Manufacturer',
            'Battery Size Recommended ',
            'EV Charger Type',
            'EPS? ',
            'Eddi?',
            'Any additional comments',
        ]
        const answerObject = await surveyDataSource.fetchAnswersFromFields(PLNumber, fieldNames, templateName)

        const request = {
            'MPAN number': answerObject['MPAN'],
            'Roof Tile Type': answerObject['Roof Type '],
            'Pitch': answerObject['Roof Pitch '],
            'Azimuth': answerObject['Roof Orientation from South '],
            'Roof Structure Type': answerObject['Roof Structure Type '],
            'Scaffolding Required': answerObject['How many side of scaffolding are required?'],
            'Inverter Manufacturer': answerObject['Manufacturer'],
            'Existing Inverter - Model Number': answerObject['Model of existing inverter '],
            'Existing Inverter - Manufacturer': answerObject['Existing Inverter Make '],
            'Battery size (kWh)': (answerObject['Battery Size Recommended ']),
            'Number of Panels': answerObject['Recommended No. of panels'],
            'EV Charger type': answerObject['EV Charger Type'],
            'Site Survey Comments': answerObject['Any additional comments'],
            'Eddi required': answerObject['Eddi?'],
            'EPS Switch': answerObject['EPS? '],
            'Site Survey Status': 'Yes'
        }
        console.log('Request', request)
        const updateRequest = await crm.setCustomFields(PLNumber, request)
        console.log('Custom fields updated');
        console.log(updateRequest)
        if (updateRequest.success)
            return json({ message: 'Custom fields updated successfully.', statusCode: 200 });
        else
            return json({ message: 'Failed to update custom fields.', statusCode: 500 });
    } catch (error) {
        console.error('Error updating custom fields', error);
        return json({ message: 'Failed to update custom fields.', statusCode: 500 });
    }
}

import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { SurveyDataSource } from '$lib/crm/safetyculture-utils.js';

const crm = new CRM()
const surveyDataSource = new SurveyDataSource()
const templateName = 'PV, Battery and EV Survey';


export async function POST({ request }) {
    try {
        const { dealId, option } = await request.json();
        const PLNumber = await crm.getPLNumberFor(dealId);

        let response;
        if (option === 1) {
            response = await createInspectionFrom(PLNumber, 'PV, Battery and EV Survey');
            const inspectionData = await surveyDataSource.searchInspectionFrom(PLNumber, 'PV, Battery and EV Survey');
            const link = `https://app.eu.safetyculture.com/inspection/${inspectionData.audit_id}`
            await crm.attachNoteFor(PLNumber, `Site Survey Form has been created for this deal.\n ${link}`)
        } else if (option === 2) {
            response = await createInspectionFrom(PLNumber, 'Installation Form');
            const inspectionData = await surveyDataSource.searchInspectionFrom(PLNumber, 'Installation Form');
            const link = `https://app.eu.safetyculture.com/inspection/${inspectionData.audit_id}`
            await crm.attachNoteFor(PLNumber, `Inspection Form has been created for this deal.\n ${link}`)
        }
        else {
            const surveyResponse = await surveyDataSource.getInspectionStatusFor(PLNumber, 'PV, Battery and EV Survey');
            const installationResponse = await surveyDataSource.getInspectionStatusFor(PLNumber, 'Installation Form');
            response = new Response(JSON.stringify({surveyStatus: surveyResponse, installationStatus: installationResponse, statusCode: 200}));
            
        }
        const responseData = await response?.json();
        return json(responseData);
    } catch (error) {
        console.log('Error:', error);
        return json({ message: "Internal server error", statusCode: 500 });
    }
}
async function createInspectionFrom(PLNumber: string, templateName: string) {
    try {
        const personName = await crm.getPersonNameFor(PLNumber);
        const propertyAddress = await crm.getCustomFieldDataFor(PLNumber, 'Address of Property')
        const response = await surveyDataSource.startSurveyFor(PLNumber, personName, propertyAddress, templateName);
        if (response.ok) {
            console.log('Inspection generated successfully.');
            return json({ message: 'Inspection generated.', statusCode: 200 });
        } else {
            console.error('Error starting inspection with deal data. Status:', response.status);
            return json({ message: 'Error starting inspection with deal data', statusCode: response.status });
        }
    } catch (error) {
        console.log('Error starting inspection with deal data', error)
        return json({ message: 'Error starting inspection with deal data', statusCode: 500 })
    }
}

async function getStatusFromInspection(PLNumber: string, templateName: string) {
    try {
        const status = await surveyDataSource.getInspectionStatusFor(PLNumber, templateName);
        let statusResponse;
        if (status) {
            if (status === 'Completed')
                statusResponse = await crm.setSurveyStatusFor(PLNumber, 'Yes');
            else if (status === 'Not Completed') {
                statusResponse = await crm.setSurveyStatusFor(PLNumber, 'No');
            }

            if (statusResponse.success) {
                console.log('Successfully updated survey status:', status);
                return json({ message: status, statusCode: 200 });
            } else {
                console.error('Failed to update survey status:', statusResponse.error_message);
                return json({ message: 'Failed to update survey status.', statusCode: 500 });
            }
        } else {
            console.error('Survey status is undefined.');
            return json({ message: undefined, statusCode: 200 });
        }
    } catch (error) {
        console.error('Error getting and updating survey status:', error);
        return json({ message: 'Internal server error', statusCode: 500 });
    }
}

async function attachPDFToDeal(PLNumber: string) {
    try {
        //Find the specific inspection that matches the PL Number || Customer Name
        //Generate PDF to that inspection 
        const responseData = await surveyDataSource.exportPdfFor(PLNumber, templateName)
        const pdfResponse = await fetch(responseData.url) // Make HTTP request to download the file

        // Convert readable stream to buffer
        const pdfArrayBuffer = await pdfResponse.arrayBuffer()
        const buffer = Buffer.from(new Uint8Array(pdfArrayBuffer));

        const filePath = '/tmp/site_survey.pdf';
        fs.writeFileSync(filePath, buffer);

        const addFileRequest = await crm.attachFileFor(PLNumber, filePath)
        fs.unlinkSync(filePath);
        console.log('PDF successfully attached to the deal.');
        return json({ message: 'PDF succesfully attached to deal.', statusCode: 200, pdfLink: responseData.url, addFileRequest: addFileRequest })

    } catch (error) {
        console.error('Error attaching PDF to the deal:', error);
        return json({ message: 'Error attaching PDF to the deal', statusCode: 500 });
    }

}

async function updatePipedriveDealFrom(PLNumber: string) {
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
            'Any additional comments'
        ]
        const answerObject = await surveyDataSource.fetchAnswersFromFields(PLNumber, fieldNames, templateName)

        const request = {
            'MPAN number': answerObject['MPAN'],
            'Roof Tile Type': answerObject['Roof Type '],
            'Pitch': answerObject['Roof Pitch '],
            'Azimuth': answerObject['Roof Orientation from South '],
            'Roof Structure Type': answerObject['Roof Structure Type '],
            'Scaffolding Required': answerObject['How many side of scaffolding are required?'],
            'Manufacturer': answerObject['Manufacturer'],
            'Existing Inverter - Model Number': answerObject['Model of existing inverter '],
            'Existing Inverter - Make': answerObject['Existing Inverter Make '],
            'New Battery size (kWh)': (answerObject['Battery Size Recommended ']).replace('kWh', ''),
            'Number of Panels': answerObject['Recommended No. of panels'],
            'EV Charger type': answerObject['EV Charger Type'],
            'Site Survey Comments': answerObject['Any additional comments'],
            'Eddi required': answerObject['Eddi?'],
            'EPS Switch': answerObject['EPS? '],
        }
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

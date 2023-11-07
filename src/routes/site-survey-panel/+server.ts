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
            response = await createInspectionFrom(PLNumber, templateName);
        } else if (option === 2) {
            response = await attachPDFToDeal(PLNumber);
        } else if (option === 3) {
            response = await updatePipedriveDealFrom(PLNumber);
        } else {
            response = await getStatusFromInspection(PLNumber, templateName);
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
            console.log('Survey generated successfully.');
            return json({ message: 'Survey generated.', statusCode: 200 });
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
        const status = await surveyDataSource.getSurveyStatusFor(PLNumber, templateName);
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

        const addFileRequest = await crm.attachPdfFor(PLNumber, filePath)
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
        const comments = await surveyDataSource.getAdditionalCommentFor(PLNumber, templateName)
        const fieldNames = [
            'Make and model of existing inverter ',
            'MPAN',
            'Roof Type ',
            'Roof Pitch ',
            'Roof Orientation from South ',
            'Roof Structure Type ',
            'How many side of scaffolding are required?',
        ]
        const answerObject = await surveyDataSource.fetchAnswersFromFields(PLNumber, fieldNames, templateName)

        const request = {
            'Existing Inverter - Make/Model/Size': answerObject['Make and model of existing inverter '],
            'MPAN number': answerObject['MPAN'],
            'Roof Tile Type': answerObject['Roof Type '],
            'Pitch': answerObject['Roof Pitch '],
            'Azimuth': answerObject['Roof Orientation from South '],
            'Roof Structure Type': answerObject['Roof Structure Type '],
            'Scaffolding Required': answerObject['How many side of scaffolding are required?'],
        }

        const updateRequest = await crm.setCustomFields(PLNumber, request)
        console.log('Custom fields updated');
        if (comments) {
            crm.attachNoteFor(PLNumber, comments);
            console.log('Additional comments attached');
        }
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

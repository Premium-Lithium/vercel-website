import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { SurveyDataSource } from '$lib/crm/safetyculture-utils.js';

const crm = new CRM()
const surveyDataSource = new SurveyDataSource()

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

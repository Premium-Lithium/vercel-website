import { json } from '@sveltejs/kit';
import fs from 'fs';
import { CRM } from '$lib/crm/crm-utils.js';
import { SurveyDataSource } from '$lib/crm/safetyculture-utils.js';

const crm = new CRM()
const surveyDataSource = new SurveyDataSource()
const templateName = 'Installation Form';

// Triggers: "TRIGGER_EVENT_INSPECTION_COMPLETED"
// Receives inspection that has been completed 
export async function POST({ request }) {
    const { data } = await request.json()

    const inspectionTitle = data.audit.audit_data.name
    const PLReference = inspectionTitle.match(/PL\d+/i)[0]
    const response = await attachPDFToDeal(PLReference)
    const responseData = await response?.json()
    return json(responseData)
}


async function attachPDFToDeal(PLNumber: string) {
    const responseData = await surveyDataSource.exportPdfFor(PLNumber, templateName)
    const pdfResponse = await fetch(responseData.url) // Make HTTP request to download the file

    // Convert readable stream to buffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(pdfArrayBuffer));

    const filePath = '/tmp/installation_form.pdf';
    fs.writeFileSync(filePath, buffer);

    const addFileRequest = await crm.attachPdfFor(PLNumber, filePath)
    fs.unlinkSync(filePath);
    console.log(`Installation Form PDF successfully attached to the deal ${PLNumber} .`);
    return json({ message: 'PDF succesfully attached to deal.', statusCode: 200, pdfLink: responseData.url, addFileRequest: addFileRequest })
}
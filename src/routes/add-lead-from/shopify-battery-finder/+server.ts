import { captureLeadFrom } from '../pipedrive-lead-utils.js'
import { extractLeadFrom } from './parse-data.js';


export async function POST({ request }) {
    const rawData = await request.text();
    const batteryFinderAnswers = JSON.parse(rawData).answers;

    const lead = await extractLeadFrom(batteryFinderAnswers);
    const leadAddAttempt = await captureLeadFrom("Battery Finder", lead);

    const response = new Response(
        JSON.stringify({ message: leadAddAttempt.message }),
        { status: leadAddAttempt.success ? 200 : 500 }
    );

    return response;
}

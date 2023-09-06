import { createPipedriveLeadFrom } from './logic.js';


export async function POST({ request }) {
    const rawData = await request.text();
    const answers = JSON.parse(rawData).answers;

    const leadAddAttempt = await createPipedriveLeadFrom(answers);

    const response = new Response(
        JSON.stringify({ message: leadAddAttempt.message }),
        { status: leadAddAttempt.success ? 200 : 500 }
    );

    return response;
}
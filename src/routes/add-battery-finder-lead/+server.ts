import { createPipedriveLeadFrom } from './logic.js';


export async function POST({ request }) {
    // if(!request.body)
    //     return json({ message: "No request body found" }, { status: 400 });

    const rawData = await request.text();
    const answers = JSON.parse(rawData).answers;

    // todo: schema validation?
    const leadAddAttempt = await createPipedriveLeadFrom(answers);

    const response = new Response(
        JSON.stringify({ message: leadAddAttempt.message }),
        { status: leadAddAttempt.success ? 200 : 500 }
    );

    return response;
}
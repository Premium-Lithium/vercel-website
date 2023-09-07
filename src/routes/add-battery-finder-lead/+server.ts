import { createPipedriveLeadFrom } from './logic.js';


export async function POST({ request }) {
    console.log("Request coming from:", request.headers);  // Log the Origin

    const rawData = await request.text();
    const answers = JSON.parse(rawData).answers;

    // const leadAddAttempt = await createPipedriveLeadFrom(answers);
    const leadAddAttempt = {
        message: "ok",
        success: true
    }

    const response = new Response(
        JSON.stringify({ message: leadAddAttempt.message }),
        { status: leadAddAttempt.success ? 200 : 500 }
    );

    response.headers.append('Access-Control-Allow-Origin', "https://admin.shopify.com/store/premium-lithium-limited/apps/revenuehunt?appLoadId=e207b847-f1ec-417e-9a31-2b92c126b9b0");

    return response;
}
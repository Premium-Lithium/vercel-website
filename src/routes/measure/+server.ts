import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';


const kpis = [
    "total_installs",
    "another_one_here"
]

const schema = {
    type: "object",
    required: [ "value", "over_period" ],
    properties: {
        value: {
            type: "string",
            enum: kpis,
            errorMessage: `'value' should be one of [${kpis.join(", ")}]`
        }
    }
}


export async function POST({ request }) {
    if (!request.body)
        return json({ message: "No request body found" }, { status: 400 });

    const requestData = await request.json();
    const validationErrors = validate(requestData, schema);

    // Check that the request body obeys the schema
    if (validationErrors.length) {
        const message = validationErrors.join(", ");
        return json({ message: `${message}` }, { status: 400 });
    }

    try {
        // const mailAttempt = await sendMail(...Object.values(requestData));
        console.log(`Reading value of ${requestData.value}`)

        // todo: return data as json
        return json(
            { message: "some value here" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending mail:", error);
        return json({ message: "Error reading KPI data" }, { status: 500 });
    }
}
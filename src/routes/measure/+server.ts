import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';
import { getRuns, getErrorRate, getAverageMessageCount } from '../chat/evie-kpis';


const kpis = [
    "total_installs",
    "evie_total_messages",
    "evie_error_rate",
    "evie_average_chat_length",
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
        console.log(`Reading value of ${requestData.value}`)
        var returnData = null;
        switch(requestData.value) {
            case kpis[0]:
                // add stuff here
                break;
            case kpis[1]:
                returnData = await getRuns();
                break;
            case kpis[2]:
                returnData = await getErrorRate();
                break
            case kpis[3]:
                returnData = await getAverageMessageCount();
                break;
        }

        // todo: return data as json
        return json(
            { message: returnData },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error reading KPI data:", error);
        return json({ message: "Error reading KPI data" }, { status: 500 });
    }
}
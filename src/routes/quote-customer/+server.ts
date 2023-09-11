import { json } from '@sveltejs/kit';
import validate from '../../lib/validation-utils.js';
import quoteCustomer from './logic.js';


const schema = {
    type: "object",
    required: [ "deal_id" ],
    properties: {
        deal_id: {
            type: "string",
            errorMessage: "deal_id should be a number (deal id from pipedrive)"
        },
    }
}


export async function POST({ request }) {
    if(!request.body)
        return json({ message: "No request body found" }, { status: 400 });

    const requestData = await request.json();
    console.log(requestData)
    const validationErrors = validate(requestData, schema);

    if(validationErrors.length) {
        const errors = validationErrors.join(", ");
        return json({ message: `${errors}` }, { status: 400 })
    }

    const quoteAttempt = await quoteCustomer(requestData.deal_id);

    return json(
        { message: quoteAttempt.message },
        { status: quoteAttempt.success ? 200 : 500 }
    );
}
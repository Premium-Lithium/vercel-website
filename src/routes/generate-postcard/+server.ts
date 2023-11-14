// todo: endpoint responsible for creating a "postcard" object, containing:
// * front image (jpg)
// * back image (jpg)
// * address

import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';
import { generatePostcardFor } from './logic';


const schema = {
    type: "object",
    required: [ "customerId" ],
    properties: {
        customerId: {
            type: "string",
            format: "uuid",
            errorMessage: "'customerId' must be a universally unique identifier according to RFC4122"
        },
    }
}


export async function POST({ request }) {
    if (!request.body)
        return json({ message: "No request body found" }, { status: 400 });

    const requestData = await request.json();
    const validationErrors = validate(requestData, schema);

    if (validationErrors.length) {
        const message = validationErrors.join(", ");
        return json({ message: `${message}` }, { status: 400 });
    }

    try {
        const customerId = requestData.customerId;
        console.log("Generating postcard for customer:", customerId);

        const postcard = generatePostcardFor(customerId);

        // todo: check that the postcard was generated correctly

        return json(
            { message: `Successfully generated postcard content for customer id ${customerId}` },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error generating postcard:", error);
        return json({ message: "Error generating postcard" }, { status: 500 });
    }
}
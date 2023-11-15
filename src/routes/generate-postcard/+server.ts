import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';
import { generatePostcardFor, getCustomerDetailsFor } from './logic';
import { STANNP_API_KEY } from '$env/static/private';


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
        const customerId: string = requestData.customerId;
        const postcard = await generatePostcardFor(customerId);

        const customer = await getCustomerDetailsFor(customerId);
        console.log("Generating postcard for customer:", customer.title + " " + customer.firstname + " " + customer.lastname);

        const sendAttempt = await sendPostcardTo(customer, postcard);

        return sendAttempt;
        // return json(
        //     { message: `Successfully generated postcard content for customer id ${customerId}` },
        //     { status: 200 }
        // );

    } catch (error) {
        console.error("Error generating postcard:", error);
        return json({ message: "Error generating postcard" }, { status: 500 });
    }
}


// todo: type annotations for parameters here
async function sendPostcardTo(customer: any, postcard: any) {
    const frontBase64 = postcard.frontImage.toString('base64');
    const backBase64 = postcard.backImage.toString('base64');

    const recipient =  { ...customer };
    console.log(recipient);

    const stannpPayload = {
        test: true,
        size: 'A5',
        front: frontBase64,
        back: backBase64,
        recipient: customer
    };

    // https://www.stannp.com/uk/direct-mail-api/postcards?lang=python
    // const API_KEY = "f2186ada5b497f22e32752f5";


    // make request to stannp
    const response = await fetch("https://dash.stannp.com/api/v1/postcards/create?api_key=" + STANNP_API_KEY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(stannpPayload)
    });

    return response;
}
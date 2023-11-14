// todo: endpoint responsible for creating a "postcard" object, containing:
// * front image (jpg)
// * back image (jpg)
// * address

import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';
import { generatePostcardFor } from './logic';
import { Buffer } from 'buffer';


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

        // 1. Create the actual content
        const postcard = await generatePostcardFor(customerId);

        // 2. Convert the content into a form that can be sent to Stannp
        console.log("converting to base64");
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (let chunk of stream) {
                chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
            }
            return Buffer.concat(chunks);
        };

        const blobToBuffer = async (blob) => {
            const stream = blob.stream();
            return await streamToBuffer(stream);
        };

        // Usage
        const frontBuffer = await blobToBuffer(postcard.front);
        const frontBase64 = frontBuffer.toString('base64');

        const backBuffer = await blobToBuffer(postcard.back);
        const backBase64 = backBuffer.toString('base64');

        // 3. Send the data to Stannp
        const stannpPayload = {
            test: true,
            size: 'A5',
            front: frontBase64,
            back: backBase64,
            recipient: {
                title: 'Mr',
                firstname: 'Lewis',
                lastname: 'Bowes',
                address1: '5 Whittam Road, Whalley',
                address2: 'Lancashire',
                city: 'Clitheroe',
                postcode: 'BB7 9SB',
                country: 'GB'
            }
        }

        // https://www.stannp.com/uk/direct-mail-api/postcards?lang=python
        const API_KEY = "f2186ada5b497f22e32752f5";

        // make request to stannp
        const response = await fetch("https://dash.stannp.com/api/v1/postcards/create?api_key=" + API_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(stannpPayload)
        });

        return response;

        // return json(
        //     { message: `Successfully generated postcard content for customer id ${customerId}` },
        //     { status: 200 }
        // );

    } catch (error) {
        console.error("Error generating postcard:", error);
        return json({ message: "Error generating postcard" }, { status: 500 });
    }
}
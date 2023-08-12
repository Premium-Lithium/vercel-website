import { json } from '@sveltejs/kit';
import addFormats from "ajv-formats";
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';

import emailSchema from './schema.js';
import sendMail from './sendMail.js';


const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
AjvErrors(ajv);


export async function POST({ request }) {
    const requestData = await request.json();
    const validationErrors = validate(requestData);

    // Check that the request body obeys the schema
    if(validationErrors.length) {
        const message = validationErrors.join(", ");
        return json({ message: `${message}` }, { status: 400 })
    }

    // todo
    sendMail(...Object.values(requestData));

    return json({ message: `Email sent successfully from ${requestData.sender}`}, { status: 200 })
}


function validate(requestData) {
    const validate = ajv.compile(emailSchema);
    const valid = validate(requestData);

    let requestErrors = [];

    if(!valid) {
        requestErrors = validate.errors.map(error => error.message);
        return requestErrors;
    }

    const sender = requestData.sender;
    if(!sender.endsWith("@premiumlithium.com"))
        requestErrors.push("Sender must be a Premium Lithium email address. ");

    return requestErrors;
}
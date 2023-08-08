import { json } from '@sveltejs/kit';
import addFormats from "ajv-formats";
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';

import quoteRequestSchema from './schema.js';


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

    // TODO: call internal send-email API to send quote request

    return json({ message: "Quote request sent" }, { status: 200 })
}

function validate(requestData) {
    const validate = ajv.compile(quoteRequestSchema);
    const valid = validate(requestData);

    let requestErrors = [];

    if(!valid)
        requestErrors = validate.errors.map(error => error.message);

    return requestErrors;
}
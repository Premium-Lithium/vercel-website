import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils.js';
import { sendMail } from './logic.js';

// IMPORTANT
/*
    The object that is passed to this API endpoint is a lie
    instead of being used as an object, passed as an object, etc
    the object is destructured , making the order of properties matter
    this is terrible, thanks I hate it

*/
const schema = {
    type: "object",
    required: [ "recipients", "sender", "subject", "mail_body", "content_type" ],
    properties: {
        recipients: {
            type: "array",
            items: { "type": "string", "format": "email" },
            errorMessage: "Recipients should be an array of valid email addresses"
        },
        sender: { "type": "string", "format": "email", "errorMessage": "Invalid sender email format" },
        subject: { "type": "string", "errorMessage": "Subject should be a string" },
        body: { "type": "string", "errorMessage": "mail_body should be a string" },
        content_type: {
            type: "string",
            enum: [ "HTML", "TEXT" ],
            errorMessage: "Content type should be either 'HTML' or 'TEXT'"
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
        const mailAttempt = await sendMail(...Object.values(requestData));
        console.log(mailAttempt);

        return json(
            { message: mailAttempt.message },
            { status: mailAttempt.success ? 200 : 500 }
        );
    } catch (error) {
        // Handle the error here, or log it if needed.
        console.error("Error sending mail:", error);
        return json({ message: "error sending mail" }, { status: 500 });
    }
}

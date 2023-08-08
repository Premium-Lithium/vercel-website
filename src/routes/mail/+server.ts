import { json } from '@sveltejs/kit';
import addFormats from "ajv-formats";
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';
import querystring from 'querystring';

import emailSchema from './schema.js';


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

    // Build the email
    const messagePayload = {
        message: {
            subject: requestData.subject,
            body: {
                contentType: requestData.content_type,
                content: requestData.mail_body
            },
            toRecipients: requestData.recipients.map(email => ({ emailAddress: { address: email } }))
        }
    };

    // Send the email
    const apiToken = await getNewAPIToken();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(messagePayload)
    };

    const apiUrl = `/v1.0/users/${requestData.sender}/sendMail`;

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            if (res.status === 202) {
                return { statusCode: 202 };
            } else {
                console.log(`API request failed with status ${res.status} ${res.statusText}`);
                return {
                    statusCode: res.status,
                    body: res.statusText
                };
            }
        })
        .catch(error => {
            return json({ message: `Failed to send email: ${error.message}`}, { status: 500 })
        });

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


async function getNewAPIToken() {
    const mailClientID = process.env.MICROSOFT_CLIENT_ID;
    const mailClientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    const data = {
        grant_type: "client_credentials",
        client_id: mailClientID,
        client_secret: mailClientSecret,
        scope: "https://graph.microsoft.com/.default"
    };
    const payload = querystring.stringify(data);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const apiUrl = `/${process.env.AUTH0_TENANT_ID}/oauth2/v2.0/token`;

    const options = {
        method: 'POST',
        headers: headers,
        body: payload
    };

    try {
        const response = await fetch(`https://login.microsoftonline.com${apiUrl}`, options);
        const data = await response.json();

        if (data.access_token) {
            const token = data.access_token;
            return token;
        } else {
            console.log('Error:', data.error_description || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error(`Fetch error: ${error.message}`);
        return null;
    }
}
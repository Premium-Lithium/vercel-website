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

    // First check that the request body obeys the schema
    const validationErrors = validate(requestData);

    if(validationErrors.length) {
        const errors = validationErrors.join(", ");
        return json({ message: `${errors}` }, { status: 400 })
    }

    // Then work out who we'd like to send emails to
    let targetInstallers = [];
    // todo: search for nearest installers here

    // Remove any installers from the list who've already responded (either by quote, or asking to unsubscribe)
    let installers = removeAlreadyResponded(targetInstallers);

    if(installers.length == 0)
        return json({ message: "All installers specified have either unsubscribed or already quoted for this job." }, { status: 202 })

    // If there are people to send an email to, then build the email
    const quoteRequest = createEmailBodyFrom(dealInfo);

    // ...and send it off to each installer
    installers.forEach(installer => {
        sendQuoteRequestTo(installer, quoteRequest);
    });

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


function removeAlreadyResponded(targetRecipients, dealId) {
    const unsubscribed = getUnsubscribed();
    const alreadyQuoted = getAlreadyQuoted(dealId);

    const alreadyResponded = [...unsubscribed, ...alreadyQuoted];
    const notYetResponded = targetRecipients.filter(email => !alreadyResponded.includes(email));

    return notYetResponded;
}

function getUnsubscribed() {
    // todo: call unsubscribe-data api, call quote-data api remove
}


function getAlreadyQuoted(dealId) {
    // todo: call quote-data api, call quote-data api remove
}


function sendQuoteRequestTo(recipient, emailBody) {
    // todo: call send-mail api
}
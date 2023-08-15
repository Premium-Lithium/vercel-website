import { json } from '@sveltejs/kit';
import prisma from '../../lib/prisma.js';
import pipedrive from 'pipedrive';
import validate from '../../lib/validation-utils.js'

const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;


const schema = {
    "type": "object",
    "properties": {
        "for_deal": {
            "type": "integer",
            "minimum": 0,
            "errorMessage": "for_deal should be a deal id (as found on Pipedrive)"
        },
        "to": {
            "type": "array",
            "items": {
                "type": "string",
                "format": "email"
            },
            "errorMessage": "'to' should be an array of valid email addresses"
        },
        "to_nearest": {
            "type": "integer",
            "minimum": 0,
            "errorMessage": "to_nearest should be a positive integer indicating the number of nearest installers"
        }
    },
    "required": ["for_deal"],
    "oneOf": [
        { "required": ["to"] },
        { "required": ["to_nearest"] }
    ],
    "errorMessage": {
        "oneOf": "The request should contain either 'to_nearest' or 'to' (not both)"
    }
}


export async function POST({ request }) {
    const requestData = await request.json();
    const validationErrors = validate(requestData, schema);

    if(validationErrors.length) {
        const errors = validationErrors.join(", ");
        return json({ message: `${errors}` }, { status: 400 })
    }

    if(!requestData.sender.endsWith("@premiumlithium.com"))
        return json({ message: "Sender must be a Premium Lithium email address." }, { status: 400 })

    // Work out who we'd like to send emails to
    let targetInstallers = [];

    if('to' in requestData) {
        console.log(`sending quote request to ${requestData.to}`);
        // todo:
        targetInstallers = requestData.to;
    }
    else if('to_nearest' in requestData) {
        console.log(`finding nearest ${requestData.to_nearest} installers to deal ${requestData.for_deal}`);

        // todo: search for nearest installers here

        targetInstallers = [];
    }

    // Remove any installers from the list who've already responded (either by quote, or asking to unsubscribe)
    let installers = await removeAlreadyResponded(targetInstallers, requestData.for_deal);

    if(installers.length == 0)
        return json({ message: "All installers specified have either unsubscribed or already quoted for this job." }, { status: 202 })

    // If there are people to send an email to, then build the email
    const dealInfo = null; // todo: load this from pipedrive
    const quoteRequest = createEmailBodyFrom(dealInfo);

    // ...and send it off to each installer
    installers.forEach(installer => {
        sendQuoteRequestTo(installer, quoteRequest);
    });

    return json({ message: "Quote request sent" }, { status: 200 })
}


async function removeAlreadyResponded(targetRecipients, dealId) {
    const unsubscribed = await getUnsubscribed();
    const alreadyQuoted = await getAlreadyQuoted(dealId);

    const alreadyResponded = [...unsubscribed, ...alreadyQuoted];
    const notYetResponded = targetRecipients.filter(email => !alreadyResponded.includes(email));

    return notYetResponded;
}


async function getUnsubscribed() {
    const unsubscribed = await prisma.unsubscribedEmails.findMany();
    const emails = unsubscribed.map(unsubscription => unsubscription["email"]);

    return emails;
}


async function getAlreadyQuoted(dealId) {
    const allQuotes = await prisma.quote.findMany();
    const quotesForDeal = allQuotes.filter(quote => quote["dealId"] == dealId);
    const installerIds = quotesForDeal.map(quote => quote["installerId"]);

    const installerEmails = await Promise.all(installerIds.map(id => getInstallerEmailFrom(id)));

    return installerEmails;
}


async function getInstallerEmailFrom(installerId) {
    const pdApi = new pipedrive.OrganizationsApi(pd)
    const orgs = await pdApi.getOrganizationPersons(installerId);
    const email = orgs.data[0].primary_email;

    return email;
}


function createEmailBodyFrom(dealInfo) {
    return "todo: the email body here"
}


function sendQuoteRequestTo(recipient, emailBody) {
    // todo: call send-mail api
    console.log(`Sending email to ${recipient} with body: ${emailBody}`);
}
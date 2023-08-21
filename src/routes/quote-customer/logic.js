import { json } from '@sveltejs/kit';
import {
    // sendMail,
    getNewAPIToken // todo: remove - only exposing for testing
} from '../send-mail/logic.js';

import nunjucks from 'nunjucks';
import pipedrive from 'pipedrive';
import fs from 'fs/promises';
import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js'
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default async function quoteCustomer(dealId) {
    const customer = await getCustomerInfo(dealId);

    if(customer === null)
        return json({}, { status: 400 });

    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution, dealId);

    const customerData = {
        pl_bdm_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name
    };

    const emailContent = await loadQuoteEmailWith(customerData);

    const emailData = {
        sender: customer.pl_contact.email,
        recipients: [ "lewisbowes0@gmail.com" ],
        subject: "Your Solar PV and BESS Quotes - Options and Next Steps",
        mail_body: emailContent,
        content_type: "HTML"
    };

    // Create a draft email in the BDM's outlook
    createDraft(...Object.values(emailData));
    // sendMail(...Object.values(emailData));

    if(!markAsQuoteIssued(dealId))
        console.log(`Failed to update deal ${dealId} as QuoteIssued`);
}


async function getCustomerInfo(dealId) {
    const pdApi = new pipedrive.DealsApi(pd)
    const request = await pdApi.getDeal(dealId);

    if(request.success === false) {
        console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        return null;
    }

    // This is the complete set of data for the deal provided by Pipedrive's API
    const customerData = request.data;

    // We want to strip this down to only the data we care about when sending a quote email
    const customer = {
        name: customerData.person_name,
        email: extractEmailFrom(customerData),
        solution: extractSolutionFrom(customerData),
        pl_contact: extractPLContactFrom(customerData)
    }

    return customer;
}


function extractEmailFrom(customerData) {
    const emails = customerData.person_id.email;

    // Try to find a home email first
    const homeEmail = emails.find(email => email.label === 'home');
    if(homeEmail !== undefined)
        return homeEmail.value;

    // Fall back to work email if home email isn't found
    console.log("No home email found, searching for work email...");
    const workEmail = emails.find(email => email.label === 'work');
    if(workEmail !== undefined)
        return workEmail.value;

    // Use any other email that's added, if there is one
    console.log("No work email found, searching for any other email...");
    if(emails.length > 0 && emails[0].value !== '') {
        const firstEmail = emails[0].value;
        console.log(`Using ${firstEmail}...`);
        return firstEmail;
    }

    console.log(`Could not find any email address for ${customerData.person_name}.`);
    return null;
}


function extractSolutionFrom(customerData) {
    const solution = {
        batterySize_kWh: parseInt(readCustomDealField("New Battery size (kWh)", customerData)),
        evCharger: {
            included: readCustomDealField("EV Charger?", customerData) == "Yes",
            type: "todo: some charger type"
        },
        // todo: Build a complete description of the solution Premium Lithium will provide
    };

    return solution;
}


function extractPLContactFrom(customerData) {
    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?
    const bdm = customerData.user_id;

    const plContactPerson = {
        name: bdm.name.split(" ")[0],
        email: bdm.email
    };

    return plContactPerson;
}


function buildPriceCalcLinkFrom(solution, dealId) {
    const params = {
        batterySize_kWh: solution.batterySize_kWh.toString(),
        evCharger: solution.evCharger.included ? "1" : "0",
        dealId: dealId
    };

    const searchParams = new URLSearchParams(params);

    const priceCalculatorURL = "https://vercel-website-liart.vercel.app/price-calculator";
    const priceCalcLink = priceCalculatorURL + '?' + searchParams.toString();

    return priceCalcLink;
}


// todo: consider breaking this out into its own utility function
// populateEmailTemplateWith(data, templatePath)?

async function loadQuoteEmailWith(customerData) {
    const filePath = join(__dirname, 'customer_quote_template.html');
    try {
        const templateString = await fs.readFile(filePath, 'utf8');

        nunjucks.configure({ autoescape: true });
        const renderedEmail = nunjucks.renderString(templateString, customerData);

        return renderedEmail;
    } catch (err) {
        const message = "Error processing the email template";
        console.error(message, err);
        return message;
    }
}


async function markAsQuoteIssued(dealId) {
    // Update the `Quote Issued` field on pipedrive with todays date
    // todo: this assumes the dealFieldsRequest was successful
    const dealFields = dealFieldsRequest.data;
    const dealsApi = new pipedrive.DealsApi(pd);

    const quoteIssuedField = dealFields.find(f => f.name === "Quote issued");

    if(quoteIssuedField === undefined) {
        console.log(`Could not find the "Quote issued" field on pipedrive`);
        return false;
    }

    await dealsApi.updateDeal(dealId, {
        [quoteIssuedField.key]: today()
    });

    // Move the deal to the quote issued stage
    const stagesApi = new pipedrive.StagesApi(pd);
    const B2C_PIPELINE_ID = 23;
    let opts = {
        'pipelineId': B2C_PIPELINE_ID,
        'start': 0,
        'limit': 56
    };
    const stages = await stagesApi.getStages(opts);

    const quoteIssuedStage = stages.data.find(s => s.name === "Quote Issued");

    await dealsApi.updateDeal(dealId, {
        stage_id: quoteIssuedStage.id
    });

    return true;
}


function today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1.
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// ======================================= draft work =======================================
async function createDraft(sender, recipients, subject, mail_body, content_type) {
    // Build a draft email given the information passed in
    console.log(`Creating draft email for ${sender}`);

    const apiToken = await getNewAPIToken();

    /*
    const QUOTE_CATEGORY_NAME = "Quote";
    const categories = await getCategories(sender, apiToken);
    const quotesCategory = categories.find(category => category.displayName === QUOTE_CATEGORY_NAME);

    if(quotesCategory === undefined) {
        createCategory(sender, QUOTE_CATEGORY_NAME, apiToken);
        return;
    }
    */

    // At this point we know the folder exists
    const messagePayload = {
        subject: subject,
        body: {
            contentType: content_type,
            content: mail_body
        },
        toRecipients: recipients.map(email => ({ emailAddress: { address: email } })),
        bccRecipients: [
            {
                emailAddress: {
                    address: "lewis.bowes@premiumlithium.com",
                }
            }
        ]
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(messagePayload)
    };

    const apiUrl = `/v1.0/users/${sender}/messages`;
    console.log(`apiUrl: ${apiUrl}`);

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            console.log(res);
            if (res.status !== 202) {
                console.log(`Error: Microsoft Graph API request failed with status ${res.status} ${res.statusText}`);
            }
        })
        .catch(error => {
            console.log(`Error: Failed to send email: ${error.message}`);
        });
}


/*
async function getCategories(userEmailAddress, apiToken) {
    console.log(`Fetching categories for ${userEmailAddress}`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken
    };

    const options = {
        method: 'GET',
        headers: headers
    };
    // todo: this breaks because the application doesn't have the `MailboxSettings.ReadWrite` permission
    const apiUrl = `/v1.0/users/${userEmailAddress}/outlook/masterCategories`;

    const response = await fetch(`https://graph.microsoft.com${apiUrl}`, options);
    if (response.status !== 202)
        console.log(`Error: Microsoft Graph API request failed with status ${response.status} ${response.statusText}`);

    const categoryData = await response.json();
    const categories = categoryData.value;

    categories.forEach(category => {
        console.log(`Category: ${category.displayName}`);
    });

    return categories;
}


async function createCategory(userEmailAddress, categoryName, apiToken) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken
    };

    const newCategory = {
        "displayName": categoryName,
        "color": "preset9"
    }

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(newCategory)
    };

    const apiUrl = `/v1.0/users/${userEmailAddress}/outlook/masterCategories`;

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            if (res.status !== 200) {
                console.log(`Error: Microsoft Graph API request failed with status ${res.status} ${res.statusText}`);
            }
        })
        .catch(error => {
            console.log(`Error: Failed to create category: ${error.message}`);
        });
}
*/
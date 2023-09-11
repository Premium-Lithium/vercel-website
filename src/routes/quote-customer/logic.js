import pipedrive from 'pipedrive';
import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js'
import { populateEmailTemplateWith } from '$lib/file-utils.js';
import { supabase } from '$lib/supabase.ts';

// todo: only used while we don't have an outlook mail client object
import { getNewAPIToken } from '../send-mail/logic.js';


export default async function quoteCustomer(dealId) {
    let quoteAttempt = {
        "success": true,
        "message": `Quote created for deal ${dealId}`
    };

    const customer = await getCustomerInfo(dealId);

    if(customer === null) {
        quoteAttempt.success = false;
        quoteAttempt.message = `Error: Could not fetch customer data for deal ${dealId}`;
        console.log(quoteAttempt.message);
        return quoteAttempt;
    }

    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution, dealId);

    const emailContentData = {
        pl_bdm_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name.split(" ")[0],
        relative_call_time: "earlier", // todo: if possible calculate this from pipedrive call logs e.g "last week", "this morning", "yesterday"
        schedule_call_link: "https://premiumlithium.com" // todo: if possible calculate this from pipedrive call logs e.g "last week", "this morning", "yesterday"
    };

    const { data, error } = await supabase
    .storage
    .from('email-template')
    .createSignedUrl('customer-quote-template.mjml', 1000);
    
    const templatePath = data.signedUrl;
    const emailContent = await populateEmailTemplateWith(emailContentData, templatePath, import.meta.url);

    const emailData = {
        sender: customer.pl_contact.email,
        recipients: [ customer.email ],
        subject: "Your Solar PV and BESS Quotes - Options and Next Steps",
        mail_body: emailContent,
        content_type: "HTML"
    };

    // Create a draft email in the BDM's outlook
    createDraft(...Object.values(emailData));

    if(!markAsQuoteIssued(dealId))
        console.log(`Failed to update deal ${dealId} as QuoteIssued`);

    console.log(quoteAttempt.message);
    return quoteAttempt;
}


async function getCustomerInfo(dealId) {
    const pdApi = new pipedrive.DealsApi(pd)
    const request = await pdApi.getDeal(dealId);

    if(request.success === false) {
        console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        return null;
    }
    console.log(request.data)
    const pdPersonApi = new pipedrive.PersonsApi(pd)
    const personRequest = await pdPersonApi.getPerson(request.data.next_activity.person_id)
    // This is the complete set of data for the deal provided by Pipedrive's API
    const customerData = personRequest.data;
    console.log(customerData)

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
    const homeEmail = emails.find(email => email.label === 'Home');
    if(homeEmail !== undefined){
        console.log("homeEmail!!!!!!!!!!!")
        return homeEmail.value;
    }
    // Fall back to work email if home email isn't found
    console.log("No home email found, searching for work email...");
    const workEmail = emails.find(email => email.label === 'Work');
    if(workEmail !== undefined){
        return workEmail.value;
    }
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
        email: bdm.email,
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


// todo: add meaningful return statements to this to indicate whether or not it worked, and catch these in quoteCustomer above
async function createDraft(sender, recipients, subject, mail_body, content_type) {
    const apiToken = await getNewAPIToken();

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
                    address: "development@premiumlithium.com",
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

    fetch(`https://graph.microsoft.com${apiUrl}`, options)
        .then(res => {
            if (res.status !== 201) {
                console.log(`Error: Microsoft Graph API request failed with status ${res.status} ${res.statusText}`);
                return res.status
            }
        })
        .catch(error => {
            console.log(`Error: Failed to create draft: ${error.message}`);
        });
}


async function markAsQuoteIssued(dealId) {
    // Update the `Quote Issued` field on pipedrive with todays date
    // todo: this assumes the dealFieldsRequest in pipedrive-utils was successful
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
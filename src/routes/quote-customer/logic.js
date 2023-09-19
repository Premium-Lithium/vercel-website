import pipedrive from 'pipedrive';
import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js'
import { populateEmailTemplateWith } from '$lib/file-utils.js';
import { supabase } from '$lib/supabase.ts';
import { json } from '@sveltejs/kit';

import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

// todo: only used while we don't have an outlook mail client object
import { getNewAPIToken } from '../send-mail/logic.js';

export default async function quoteCustomer(dealId, addAttachment) {
    let quoteAttempt = {
        "success": true,
        "message": `Quote created for deal ${dealId}`
    };

    const customer = await getCustomerInfo(dealId);

    if(customer === null) {
        quoteAttempt.success = false;
        quoteAttempt.message = `: Could not fetch customer data for deal ${dealId}`;
        console.log(quoteAttempt.message);
        return quoteAttempt;
    }

    let emailData = {
        sender: customer.pl_contact.email,
        recipients: [customer.email],
        subject: "Your Solar PV and BESS Quotes - Options and Next Steps",
        email_body: "error",
        content_type: "text"
    };
    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution, dealId);
    const emailContentData = {
        pl_bdm_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name.split(" ")[0],
        relative_call_time: "earlier", // todo: if possible calculate this from pipedrive call logs e.g "last week", "this morning", "yesterday"
        schedule_call_link: "https://premiumlithium.pipedrive.com/scheduler/dwXzamsKQ/telephone-consultation-with-renewables-consultant" 
    };
    try{
        console.log("getting email template")
        const { data, error } = await supabase
        .storage
        .from('email-template')
        .createSignedUrl('customer-quote-template.mjml', 60)
        if (data){
            const templatePath =data.signedUrl;
            const emailContent = await populateEmailTemplateWith(emailContentData, templatePath, import.meta.url);

            emailData.email_body = emailContent;
            emailData.content_type = "HTML";
            // Create a draft email in the BDM's outlook
            await createDraft(...Object.values(emailData), addAttachment);
            if (!markAsQuoteIssued(dealId)) {
                console.log(`Failed to update deal ${dealId} as QuoteIssued`);
                quoteAttempt = {
                    "success": false,
                    "message": `Failed to update deal ${dealId} as QuoteIssued`
                };
                return quoteAttempt;
            }
        }
            return quoteAttempt;
        } catch (error) {
            console.log("error finding email template");
            // Create a draft email in the BDM's outlook
            await createDraft(...Object.values(emailData), addAttachment);
            return (quoteAttempt = { success: false, message: "error finding email template" });
        }
}


async function getCustomerInfo(dealId) {
    console.log("getting customer info..............")
    const pdApi = new pipedrive.DealsApi(pd)
    const request = await pdApi.getDeal(dealId);

    if(request.success === false) {
        console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        return request;
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
    console.log("extracting email...........................")
    const emails = customerData.person_id.email;

    // Try to find a home email first
    const homeEmail = emails.find(email => email.label === 'home');
    if(homeEmail !== undefined){
        return homeEmail.value;
    }
    // Fall back to work email if home email isn't found
    console.log("No home email found, searching for work email...");
    const workEmail = emails.find(email => email.label === 'work');
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
    return json({status: 500, message: "could not find email"});
}


function extractSolutionFrom(customerData) {
    console.log("extract solution...........")
    try{
        const solution = {
            batterySize_kWh: parseInt(readCustomDealField("New Battery size (kWh)", customerData)),
            evCharger: {
                included: readCustomDealField("EV Charger?", customerData) == "Yes",
                type: "todo: some charger type"
            },
            // todo: Build a complete description of the solution Premium Lithium will provide
        };
        return solution;
    }catch(error){ //default solution for if a deal doesnt have one 
        const solution = {
            batterySize_kWh: 15,
            evCharger: { included: true, type: 'todo: some charger type' }
          }
        return solution;
    }
}


function extractPLContactFrom(customerData) {
    console.log("pl contact..........................")
    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?
    const bdm = customerData.user_id;
    const plContactPerson = {
        name: bdm.name.split(" ")[0],
        email: bdm.email,
    };

    return plContactPerson;
}


function buildPriceCalcLinkFrom(solution, dealId) {
    console.log("byuilding price calc link ...............")
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


async function createDraft(sender, recipients, subject, mail_body, content_type, addAttachment) {
    try {
        console.log("creating draft...................................")
        const apiToken = await getNewAPIToken();
        if (apiToken === null) {
            console.log("error creating API token");
            return json({status: 500}, {statusText: "error creating api token"});
        }
        let attachment = [];
        //  stays false until we get attachments we want to add to emails
        // todo remove when we have attachments to send .......
        const contentBytes = await getAttachments();
        if (addAttachment === true){
            console.log("ADD ATTACHMENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            attachment = [{
                        '@odata.type': "#microsoft.graph.fileAttachment",
                        "name": "attachment.pdf",
                        "contentType": "application/pdf",
                        "contentBytes": contentBytes,
                    }]
        }
        const messagePayload = {
                subject: subject,
                body: {
                    contentType: content_type,
                    content: mail_body,
                },
                toRecipients: recipients.map(email => ({ emailAddress: { address: email } })),
                bccRecipients: [
                    {
                        emailAddress: {
                        address: "development@premiumlithium.com",
                        }
                    }
                ],
                attachments: attachment
            };

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiToken,
            };

            const options = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(messagePayload),
            };

            const apiUrl = `/v1.0/users/${sender}/messages`;

            const response = await fetch(`https://graph.microsoft.com${apiUrl}`, options);
            if (response.status !== 201) {
                console.log(`Error: Microsoft Graph API request failed with status ${response.status} ${response.statusText}`);
                // Handle the error here or throw it to be caught by the caller.
                throw new Error(`Microsoft Graph API request failed with status ${response.status} ${response.statusText}`);
            }
            return response;
    } catch (error) {
        console.log(`Error: Failed to create draft: ${error}`);
        // Handle the error here or throw it to be caught by the caller.
        return json({status: 500},{statusText: "failed to create draft"});
    }
}

async function getAttachments(){
    //using the solution get the datasheets for products the customer is interested in
    // (datasheets stored in bucket on supabase)
    console.log("getting email attachments")
        const { data, error } = await supabase
        .storage
        .from('email-template')
        .createSignedUrl('/attachments/pdf1.pdf', 100)
    if (error != null ){
        console.log("error geting attachment");
        return null;
    }
    const contentByte = getContentBytes(data.signedUrl);
    return contentByte
}

async function getContentBytes(filePath){
    const res = await fetch(filePath);
    const uint8Array = new Uint8Array(await res.arrayBuffer());
    const contentBytes = Buffer.from(uint8Array).toString('base64');
    return contentBytes;
}

async function markAsQuoteIssued(dealId) {
    console.log("marking quote as issued ")
    // Update the `Quote Issued` field on pipedrive with todays date
    const dealsApi = new pipedrive.DealsApi(pd);
    const dealFields = dealFieldsRequest.data;
    if (dealFieldsRequest.data === undefined){
        console.log("failed to fetch deals data")
        return false;
    }
    const quoteIssuedField = dealFields.find(f => f.name === "Quote issued");
    console.log("checking if field exists.....................................")
    if(quoteIssuedField === undefined) {
        console.log(`Could not find the "Quote issued" field on pipedrive`);
        return false;
    }
    console.log("updating deal.............")
    try{
        let res = await dealsApi.updateDeal(dealId, {
            [quoteIssuedField.key]: today()
        });
        if (res){
            console.log("updated deal")
        }else{
            console.log("error updating deal")
        }
    }catch(error){
        return false
    }
    // // Move the deal to the quote issued stage
    const stagesApi = new pipedrive.StagesApi(pd);
    const B2C_PIPELINE_ID = 23;
    let opts = {
        'pipelineId': B2C_PIPELINE_ID,
        'start': 0,
        'limit': 56
    };
    const stages = await stagesApi.getStages(opts);
    const quoteIssuedStage = stages.data.find(s => s.name === "Quote Issued");
    console.log("finding quote issued stage")
    if (quoteIssuedStage === undefined){
        console.log("failed to find quote issued stage")
        return false;
    }
    try{
        let response = await dealsApi.updateDeal(dealId, {
            stage_id: quoteIssuedStage.id
        });
        if (response){
            return true;
        }else{
            console.log("failed to move deal to stage");
            return false;
        }
    }catch(error){
        return false;
    }
}


function today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1.
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
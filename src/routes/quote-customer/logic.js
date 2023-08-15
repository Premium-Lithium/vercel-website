import { json } from '@sveltejs/kit';
import sendMail from '../send-mail/logic.js';
import nunjucks from 'nunjucks';
import pipedrive from 'pipedrive';
import fs from 'fs/promises';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js'
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default async function quoteCustomer(dealId) {
    const customer = await getCustomerInfo(dealId);

    if(customer === null)
        return json({}, { status: 400 });

    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution);

    const customerData = {
        pl_bdm_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name
    };

    const emailContent = await loadQuoteEmailWith(customerData);

    sendMail(
        [ customer.email ],
        customer.pl_contact.email,
        "Your quote",
        emailContent,
        "HTML"
    );
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
    // todo: get PL contact email from pipedrive

    // Fetch the pipedrive call logs and get the name of the most recent person who called the customer.

    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?

    const plContactPerson = {
        name: "Lewis Bowes",
        email: "lewis.bowes@premiumlithium.com"
    };

    return plContactPerson;
}


function buildPriceCalcLinkFrom(solution) {
    const params = {
        batterySize_kWh: solution.batterySize_kWh.toString(),
        evCharger: solution.evCharger.included ? "1" : "0"
    };

    const searchParams = new URLSearchParams(params);

    const priceCalculatorURL = "http://localhost:3000/price-calculator"; // let priceCalculatorURL = "https://vercel-website-liart.vercel.app/price-calculator";
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
import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import { join, dirname as pathDirname } from 'path';  // Rename dirname to pathDirname to avoid naming conflicts
import { fileURLToPath } from 'url';
import priceOf from '../price-calculator/price-model';
import pipedrive from 'pipedrive';
import nunjucks from 'nunjucks';
import sendMail from '../send-mail/sendMail.js';
import readCustomDealField from '../../lib/pipedrive-utils.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);


// todo: move this into a separate file, initialise once there and import here
const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;


export async function POST({ request }) {
    const data = await request.json();

    // todo: validate request body

    const dealId = data.deal_id;
    const customer = await getCustomerInfo(dealId);

    if(customer === null)
        return json({}, {status: 400});

    const price = priceOf(customer.solution);
    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution);

    const customerData = {
        pl_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name,
        products: [
            { quantity: 1, name: "10 kWh PowerPod" },
            { quantity: 1, name: "EV Charger" }
        ],
        total_price: price.total
    };

    // 5. send email
    const emailContent = await loadQuoteEmailWith(customerData);

    sendMail(
        [ customer.email ],
        customer.pl_contact.email,
        "Your quote",
        emailContent,
        "HTML"
    );

    return json({}, {status: 200})
}


async function getCustomerInfo(dealId) {
    const pdApi = new pipedrive.DealsApi(pd)
    const request = await pdApi.getDeal(dealId);

    if(request.success === false) {
        console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        return null;
    }

    const customerData = request.data;

    const name = customerData.person_name;
    const email = extractEmailFrom(customerData);
    const solution = extractSolutionFrom(customerData);
    const plContactPerson = extractPLContactFrom(customerData);

    const customer = {
        name: name,
        email: email,
        solution: solution,
        pl_contact: plContactPerson
    }

    return customer;
}


function buildPriceCalcLinkFrom(customerSolution) {
    const params = {
        batterySize_kWh: customerSolution.batterySize_kWh.toString(),
        evCharger: customerSolution.evCharger ? "1" : "0",
    };

    const searchParams = new URLSearchParams(params);

    // let priceCalculatorURL = "https://vercel-website-liart.vercel.app/price-calculator";
    const priceCalculatorURL = "http://localhost:3000/price-calculator";

    const priceCalcLink = priceCalculatorURL + '?' + searchParams.toString();

    return priceCalcLink;
}


function extractEmailFrom(customerData) {
    const emails = customerData.person_id.email;

    // Try to find a home email first
    const homeEmail = emails.find(email => email.label === 'home');
    if(homeEmail !== undefined)
        return homeEmail.value;

    // Fall back to work email if this isn't found
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
        evCharger: readCustomDealField("EV Charger?", customerData) == "Yes"
        // todo: Build a complete description of the solution Premium Lithium will provide
    };

    return solution;
}


function extractPLContactFrom(customerData) {
    // todo: get PL contact email from pipedrive

    // Fetch the pipedrive call logs and get the name of the most recent person who called the customer.

    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?

    const plContact = {
        name: "Lewis Bowes",
        email: "lewis.bowes@premiumlithium.com"
    };

    return plContact;
}


async function loadQuoteEmailWith(customerData) {
    const filePath = join(__dirname, 'customer_quote_template.html'); // Replace 'emailTemplate.html' with your actual file name
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
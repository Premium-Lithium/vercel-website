import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import { join, dirname as pathDirname } from 'path';  // Rename dirname to pathDirname to avoid naming conflicts
import { fileURLToPath } from 'url';
import priceOf from '../price-calculator/price-model';
import pipedrive from 'pipedrive';
import nunjucks from 'nunjucks';


const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);


// todo: move this into a separate file, initialise once there and import here
const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;


export async function POST({ request }) {
    const data = await request.json();

    // todo: validate request body

    const dealId = data.deal_id; // todo: get this from the request

    const dealInfo = await getDealInfo(dealId);
    const customerName = dealInfo.data.person_name;

    // 1. todo: build description of customer solution from pipedrive given dealId above
    const customerSolution = {
        batterySize_kWh: 10,
        evCharger: true
    };

    // 2. Use the customer's solution to calculate a price
    const price = priceOf(customerSolution);

    // 3. build price-calculator url link with correct query params
    let params = {
        batterySize_kWh: customerSolution.batterySize_kWh.toString(),
        evCharger: customerSolution.evCharger ? "1" : "0",
    };

    // Create an instance of URLSearchParams with the params object
    let searchParams = new URLSearchParams(params);

    // Construct the full URL
    let priceCalculatorURL = "https://vercel-website-liart.vercel.app/price-calculator";
    let priceCalcLink = priceCalculatorURL + '?' + searchParams.toString();
    console.log(priceCalcLink);

    // 5. render template with content, including breakdown of price into components
    const customerData = {
        // todo: include template variables here like BDM name, customer name, install date, custom msg etc
        customer_name: customerName,
        products: [
            { quantity: 1, name: "10 kWh PowerPod" },
            { quantity: 1, name: "EV Charger" }
        ],
        total_price: price.total
    };

    // 5. send email
    const emailContent = await loadQuoteEmailWith(customerData);

    sendMail();

    return json({}, {status: 200})
}

async function getDealInfo(dealId) {
    const pdApi = new pipedrive.DealsApi(pd)
    const dealInfo = await pdApi.getDeal(dealId);

    return dealInfo;
}


async function loadQuoteEmailWith(customerData) {
    const filePath = join(__dirname, 'customer_quote_template.html'); // Replace 'emailTemplate.html' with your actual file name
    try {
        const templateString = await fs.readFile(filePath, 'utf8');

        nunjucks.configure({ autoescape: true });
        const renderedEmail = nunjucks.renderString(templateString, customerData);

        return renderedEmail;
    } catch (err) {
        console.error('Error processing the email template:', err);
    }
}
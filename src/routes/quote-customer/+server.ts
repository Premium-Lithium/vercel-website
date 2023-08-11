import { json } from '@sveltejs/kit';
import priceOf from '../price-calculator/price-model';
import pipedrive from 'pipedrive';


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

    // 4. Load template file

    // 5. render template with content, including breakdown of price into components
    const templateVariables = {
        // todo: include template variables here like BDM name, customer name, install date, custom msg etc
        products: [
            { quantity: 1, name: "10 kWh PowerPod" },
            { quantity: 1, name: "EV Charger" }
        ],
        totalPrice: price.total
    };

    // 5. send email

    return json({}, {status: 200})
}

async function getDealInfo(dealId) {
    const pdApi = new pipedrive.DealsApi(pd)
    const dealInfo = await pdApi.getDeal(dealId);

    return dealInfo;
}
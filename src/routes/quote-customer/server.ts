import { json } from '@sveltejs/kit';
import priceOf from '../price-calculator/price-model';


export async function POST({ request }) {
    const data = await request.json();

    const dealId = 0; // todo: get this from the request

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

import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { XeroClient } from 'xero-node';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import { redirect } from '@sveltejs/kit';

const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel/xero-callback"

const xero = new XeroClient({
  clientId: XERO_CLIENT_ID,
  clientSecret: XERO_CLIENT_SECRET,
  redirectUris: [XERO_REDIRECT_URI],
  scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
  state: 'hastalavista', // custom params (optional)
  httpTimeout: 3000, // ms (optional)
  clockTolerance: 10 // seconds (optional)
});
 
async function fetchDealData(dealId) {
    try {
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);

        let consentUrl = await xero.buildConsentUrl();
        console.log(consentUrl)
        throw redirect(302,consentUrl)
        if (requestDeal.success) {
            const dealData = requestDeal.data
            return dealData;
        } else {
            console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
            return json({ error: 'An error occurred' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}


export async function POST({ request }) {
    try {
        const { dealId } = await request.json();
        const dealData = await fetchDealData(dealId);
        const paymentData = getPaymentDataFrom(dealData)
        return json(paymentData);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "Can't get dealData" })
    }
}

function getPaymentDataFrom(dealData){
    const paymentData = {
        plan: readCustomDealField('Configurator Plan', dealData),
        price: dealData.value
    }
    return paymentData
}



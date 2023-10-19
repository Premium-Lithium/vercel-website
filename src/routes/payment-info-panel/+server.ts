import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { XeroClient } from 'xero-node';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import { accessToken } from '$lib/payment-info-panel/sessionStore.js';


const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel/xero-callback"

const xero = new XeroClient({
    clientId: XERO_CLIENT_ID,
    clientSecret: XERO_CLIENT_SECRET,
    grantType: 'client_credentials'
});

async function fetchDealData(dealId) {
    try {
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);

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

function getPaymentDataFrom(dealData) {
    const paymentData = {
        plan: readCustomDealField('Configurator Plan', dealData),
        price: dealData.value
    }
    return paymentData
}

async function getInvoice(){
    const token = await xero.getClientCredentialsToken();
    xero.setTokenSet(token);
    accessToken.set(token)
    const xeroTenantId = 'YOUR_XERO_TENANT_ID';
    const invoiceID = '00000000-0000-0000-0000-000000000000';
    const unitdp = 4;
    
}
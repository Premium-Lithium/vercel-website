import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { XeroClient } from 'xero-node';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import { accessToken } from '$lib/payment-info-panel/sessionStore.js';
import querystring from 'querystring';
import { redirect } from '@sveltejs/kit';

const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel"

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
        const { dealId, tempCode } = await request.json();

        const dealData = await fetchDealData(dealId);
        const paymentData = getPaymentDataFrom(dealData);
        const tokens = await exchangeTokenFrom(tempCode);

    
        //store token to supabase (?)
        //getConnections(token)
        const allInvoices = await getInvoices(tokens.access_token);
        let data = {
            paymentData: paymentData,
            invoice: getInvoiceFromRef(allInvoices, 'PL0005577')
        }
        return json(data);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "Can't get dealData" })
    }
}

//Payment Data would need enough information to conenct with invoice, such as
//PersonID.name: e.g Richard Goodenough
//PL Number: eg. PL0005577
//Identifier for Reference
function getPaymentDataFrom(dealData) {
    const paymentData = {
        plan: readCustomDealField('Configurator Plan', dealData),
        price: dealData.value
    }
    return paymentData
}

//Invoices:
// Amount Due   |   Paid      | 
async function getInvoices(token) {
    const response = await fetch('https://api.xero.com/api.xro/2.0/Invoices', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Xero-Tenant-Id': 'e5585144-93da-4f1d-8c66-61c05d103e70',
            'Accept': 'application/json'
        }
    })
    const responseData = await response.json()
    const invoices = responseData.Invoices //Array of invoices
    return invoices
}

//WIP 
async function refreshToken(refresh_token) {
    const data = {
        grant_type: 'authorization_code',
        refresh_token: refresh_token
    }
    const payload = querystring.stringify(data)
    const headers = {
        'Authorization': "Basic " + btoa(XERO_CLIENT_ID + ":" + XERO_CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const options = {
        method: 'POST',
        headers: headers,
        body: payload
    }
    const response = await fetch("https://identity.xero.com/connect/token", options)
    const responseData = await response.json();
    return responseData
}

//getInvoiceFromRef
function getInvoiceFromRef(invoices, reference) {
    let invoiceFound = []
    for (const i in invoices) {
        if (invoices[i].Reference === reference) {
            invoiceFound.push(invoices[i])
        }
    }
    return invoiceFound
}
//Check the authorized tenants (getting the xero-tenant-id)
async function getConnections(token) {
    console.log("Token", token)
    const response = await fetch('https://api.xero.com/connections', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    const responseData = await response.json()
    console.log(responseData)

}
async function exchangeTokenFrom(code) {
    const data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: XERO_REDIRECT_URI
    }
    const payload = querystring.stringify(data)

    const headers = {
        'Authorization': "Basic " + btoa(XERO_CLIENT_ID + ":" + XERO_CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const options = {
        method: 'POST',
        headers: headers,
        body: payload
    }
    try {
        const response = await fetch("https://identity.xero.com/connect/token", options)
        const data = await response.json();

        if (data) {
            const token = data;
            return token;
        } else {
            console.log('Error exchanging token');
            return null;
        }
    } catch (error) {
        console.log("Error fetching")
    }
}
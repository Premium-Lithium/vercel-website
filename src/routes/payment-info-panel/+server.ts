import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { XeroClient, Invoices, Invoice, LineItem, Contact } from 'xero-node';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import querystring from 'querystring';
import fs from 'fs';
import path from 'path';

const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel"



const xero = new XeroClient({
    clientId: XERO_CLIENT_ID,
    clientSecret: XERO_CLIENT_SECRET,
    redirectUris: [XERO_REDIRECT_URI],
    scopes: 'openid profile email accounting.transactions accounting.attachments accounting.contacts accounting.settings.read offline_access'.split(" "),
});


export async function POST({ request }) {
    try {
        const { dealId, tempCode } = await request.json();

        const dealData = await fetchDealData(dealId);
        const paymentData = getPaymentDataFrom(dealData);
        const tokenSet = await getTokenSetFrom(tempCode);
        await fetchProductsFromDeal(dealId)
        //store token to supabase (?)
        const activeTenantId = await startXero(tokenSet)
        const allInvoices = await getInvoices(activeTenantId);
        const bufferD = await getInvoiceAsPDF(activeTenantId, "ca348509-7c4f-4bf4-8a94-0b43c71cd1d1")
        //xero.invoices.streamInvoice('3f887d04-cbd9-4853-b594-bc1ab207558c', 'pdf', stream);
        let data = {
            paymentData: paymentData,
            invoice: getInvoiceFromRef(allInvoices, 'PL0005577'),
            buffer: bufferD
        }
        return json(data);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "Can't get dealData" })
    }
}

export async function GET({ request }) {
    try {
        let consentUrl = await xero.buildConsentUrl();
        console.log(consentUrl)
        return (new Response(JSON.stringify(consentUrl)))
    } catch (error) {
        console.log("Error")
    }
}

//Initialization 
//Get Active Tenant
async function startXero(tokenSet) {
    console.log(tokenSet)
    
    tokenSet = {
        id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE2OTgwMDc1MjMsImV4cCI6MTY5ODAwNzgyMywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6IjU4NTY2OTY4QzU0QjQwMUY4Mjg1NEY2QzYzM0U0M0I1IiwiaWF0IjoxNjk4MDA3NTIzLCJhdF9oYXNoIjoiWTZ1OEJmZVp6NjFSN0c0OVY5SE9YdyIsInNpZCI6IjIzYjI5MjU4NTgyODQ5ZTFhZjI0MGJmOTAzOTg1YmRiIiwic3ViIjoiOGMzY2UzNjdjNmNkNWZlM2FhMWUwNmI2MjBhNmY5OWEiLCJhdXRoX3RpbWUiOjE2OTgwMDY0NTMsInhlcm9fdXNlcmlkIjoiYWExZTFlNzYtYTY4ZS00ZjRmLThlNWEtZmFjZjdkMzA1MDVlIiwiZ2xvYmFsX3Nlc3Npb25faWQiOiIyM2IyOTI1ODU4Mjg0OWUxYWYyNDBiZjkwMzk4NWJkYiIsInByZWZlcnJlZF91c2VybmFtZSI6Im5pY2hvbGFzLmRoYXJtYWRpQHByZW1pdW1saXRoaXVtLmNvbSIsImVtYWlsIjoibmljaG9sYXMuZGhhcm1hZGlAcHJlbWl1bWxpdGhpdW0uY29tIiwiZ2l2ZW5fbmFtZSI6Ik5pY2hvbGFzIiwiZmFtaWx5X25hbWUiOiJEaGFybWFkaSIsIm5hbWUiOiJOaWNob2xhcyBEaGFybWFkaSIsImFtciI6WyJwd2QiXX0.Zbkj0O7HJLbMPrpW2MTHvVvAMyG-YOQduBQQRgh8m0-XiOKvbGCFewXEIj_ehKmFYZhip9CbPGE4MeYJZZzawPOY4YnyCdRtH_Bh24N8amlghfELLLC2tuPH-30v-hz5xZv0NBcK9caMa7u7fG9aXRlUR5E_iShFMUDhN4cIXAK3cSqOK3ArhnO2n9LUjjn68RtTtLYCo7hU10AOS70GXr-R3ZUNK9O9eS78E8IN8N1LAtKJH_U3yF_gc9QBShutnhO4PUmY9onbWUaud11cK7aNpLNrRx9a2Ns80WsmUoEjN1MLufEyJkb4zX8nfE_Z5Yg2zVJaUX9ZYzwc82M28Q',
        access_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE2OTgwMDc1MjMsImV4cCI6MTY5ODAwOTMyMywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiNTg1NjY5NjhDNTRCNDAxRjgyODU0RjZDNjMzRTQzQjUiLCJzdWIiOiI4YzNjZTM2N2M2Y2Q1ZmUzYWExZTA2YjYyMGE2Zjk5YSIsImF1dGhfdGltZSI6MTY5ODAwNjQ1MywieGVyb191c2VyaWQiOiJhYTFlMWU3Ni1hNjhlLTRmNGYtOGU1YS1mYWNmN2QzMDUwNWUiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6IjIzYjI5MjU4NTgyODQ5ZTFhZjI0MGJmOTAzOTg1YmRiIiwic2lkIjoiMjNiMjkyNTg1ODI4NDllMWFmMjQwYmY5MDM5ODViZGIiLCJqdGkiOiI5MDlGMzczNUJDMUI1MTNBOURFRUU3QzA2OTAwNDVBMiIsImF1dGhlbnRpY2F0aW9uX2V2ZW50X2lkIjoiZWUwMTVlMjktYTZhZi00YmRjLWExYTEtM2U4MzVkYTcyYjE4Iiwic2NvcGUiOlsiZW1haWwiLCJwcm9maWxlIiwib3BlbmlkIiwiYWNjb3VudGluZy5zZXR0aW5ncy5yZWFkIiwiYWNjb3VudGluZy5hdHRhY2htZW50cyIsImFjY291bnRpbmcudHJhbnNhY3Rpb25zIiwiYWNjb3VudGluZy5jb250YWN0cyIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.pnCU_rHEmynL66kaDKJge5NZW_8Yj9cbo7fsXqlHmKoZXD2zncPSSTn-_nTGLz15xmM2t_RyjskiTNwlGtbTd2t640Yk7M6Wl0gvLo7aAg6NB5nh5VtllKxY5kgLEyuaNXTWTTG5UObedBai11CUUSQum8GjL-VU44QLZu-6X9UI-24zLedpUwsbRNtS0I_-pasxEsirGj637uVG0caeBE4DdAyZyG29XVtWYsh-GJhJVtRNgvyyievctGEMh_G5YLJNFbBgTdmC0StRUq1CMSZS1HDh-yjEKjvCjaNCowkpAS_k1gWAYJaSzgY_eCltZUDCZa6wtVGHvfrsWLr4gw',
        expires_in: 1800,
        token_type: 'Bearer',
        refresh_token: '43s3N48uwNIqwIsyLak3YAIKxP8bfqQbAGrKYb8me1w',
        scope: 'openid profile email accounting.transactions accounting.attachments accounting.contacts accounting.settings.read offline_access'
      }
      
    try {
        await xero.initialize();
        await xero.setTokenSet(tokenSet);
        await xero.updateTenants(); //Get connections
        const activeTenantId = xero.tenants[0].tenantId; //Get xero-tenant-id
        return activeTenantId
    } catch (error) {
        console.log("Error", error)
    }
}

async function getContacts(activeTenantId) {
    try {
        const response = await xero.accountingApi.getContacts(activeTenantId)
        console.log(response.body || response.response.statusCode)
    } catch (error) {
        console.log(error)
    }

}

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

async function fetchProductsFromDeal(dealId) {
    try {
        const response = await fetch(`https://api.pipedrive.com/v1/deals/${dealId}/products?api_token=77a5356773f422eb97c617fd7c37ee526da11851`)
        const responseData = await response.json()
        const products = responseData.data.map((item) => {
            return {
                name: item.name,
                price: item.item_price,
                quantity: item.quantity,
                tax: item.tax,
            };
        });
        console.log("Products List:", products)
        return products

    } catch (error) {
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}

//Type
//Contact
//Line Items
async function createXeroInvoice(activeTenantId) {
    try {
        const dateValue = '2020-10-10'
        const dueDateValue = '2020-10-28'

        const contact: Contact = {
            contactID: "817588c0-b1e5-4e4c-9e2e-3ded7ae9335c"
        };

        const lineItem: LineItem = {
            description: "Foobar",
            quantity: 1.0,
            unitAmount: 20.0,
            accountCode: "000"
        };
        const lineItems = [];
        lineItems.push(lineItem)

        const invoice: Invoice = {
            type: Invoice.TypeEnum.ACCREC,
            contact: contact,
            date: dateValue,
            dueDate: dueDateValue,
            lineItems: lineItems,
            reference: "Website Design",
            status: Invoice.StatusEnum.DRAFT
        };

        const invoices: Invoices = {
            invoices: [invoice]
        };

        const response = await xero.accountingApi.createInvoices(activeTenantId, invoices);
        console.log(response.response.statusCode)

    } catch (error) {
        console.log("Error creating invoice", error)
    }
}


//TO DO - create a valid invoice from a deal 
async function createXeroInvoiceFromDeal(dealId) {
    const person = {
        name: "",

    }
    const products = fetchProductsFromDeal(dealId)




    const data = {

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
    const response = await fetch('https://api.xero.com/api.xro/2.0/Invoices', options)
    const responseData = await response.json();
    return responseData
}


//Payment Data would need enough information to generate Xero invoice, such as
//PersonID.name: e.g Richard Goodenough
//PL Number: eg. PL0005577
//Date:
//Product Details: Name, Price, Quantity, Tax
//Identifier for Reference
function getPaymentDataFrom(dealData) {
    const paymentData = {
        plan: readCustomDealField('Configurator Plan', dealData),
        price: dealData.value,
        pl_number: readCustomDealField('PL Number', dealData)
    }
    return paymentData
}


async function getInvoiceAsPDF(activeTenantId, invoiceId) {
    try {
        const options = {
            headers: {
                'Accept': 'application/pdf',
            }
        }
        const response = await xero.accountingApi.getInvoiceAsPdf(activeTenantId, invoiceId, options)
        return response.body //returns Buffer 
    } catch (error) {
        console.log("Error fetching as PDF", error)
    }
}

//TO DO - attachPDF to Pipedrive Deals(?)


//Invoices:
// Amount Due   |   Paid      | 
async function getInvoices(activeTenantId) {
    try {
        const response = await xero.accountingApi.getInvoices(activeTenantId)
        const invoices = response.body.invoices
        return invoices
    } catch (error) {
        console.log(error)
    }
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
        if (invoices[i].reference === reference) {
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
async function getTokenSetFrom(code) {
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
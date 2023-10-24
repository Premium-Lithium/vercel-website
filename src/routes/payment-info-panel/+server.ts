import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { XeroClient, Invoices, Invoice, LineItem, Contact } from 'xero-node';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import querystring from 'querystring';
import fs from 'fs';


const XERO_CLIENT_ID = "58566968C54B401F82854F6C633E43B5"
const XERO_CLIENT_SECRET = "xHotLIrz1eeZqG3Ggeny7SNISo3XcLkFuwC9hMewAGmJodD2"
const XERO_REDIRECT_URI = "http://localhost:3000/payment-info-panel"

const SAFETY_CULTURE_TOKEN = "f5a8b512b90d4ea239858d63f768cdbcdb8cd83c6bd2216001ceb5f20a35632c"

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
        const allInvoices = await getXeroInvoicesFrom(activeTenantId);
        const pdfBuffer = await exportXeroInvoiceAsPDF(activeTenantId, "ca348509-7c4f-4bf4-8a94-0b43c71cd1d1")
        
        let data = {
            paymentData: paymentData,
            invoice: getXeroInvoiceFromRef(allInvoices, 'PL0005577'),
            buffer: pdfBuffer,
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
// TO DO - refresh the token so user does not need to keep on clicking authorize multiple times
// Gets token from supabase and check if its expired, then refresh
async function startXero(tokenSet) {
    console.log(tokenSet)
    tokenSet = {
        id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE2OTgxNjI2MDAsImV4cCI6MTY5ODE2MjkwMCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6IjU4NTY2OTY4QzU0QjQwMUY4Mjg1NEY2QzYzM0U0M0I1IiwiaWF0IjoxNjk4MTYyNjAwLCJhdF9oYXNoIjoicS1hNGZKRHIwbXB1UFlpYTVSRFY2dyIsInNpZCI6ImI0ZDNmY2FiMTkxMTRiMGVhZWI3MTk1MTZlZjg0ZjAzIiwic3ViIjoiOGMzY2UzNjdjNmNkNWZlM2FhMWUwNmI2MjBhNmY5OWEiLCJhdXRoX3RpbWUiOjE2OTgxNjI1ODYsInhlcm9fdXNlcmlkIjoiYWExZTFlNzYtYTY4ZS00ZjRmLThlNWEtZmFjZjdkMzA1MDVlIiwiZ2xvYmFsX3Nlc3Npb25faWQiOiJiNGQzZmNhYjE5MTE0YjBlYWViNzE5NTE2ZWY4NGYwMyIsInByZWZlcnJlZF91c2VybmFtZSI6Im5pY2hvbGFzLmRoYXJtYWRpQHByZW1pdW1saXRoaXVtLmNvbSIsImVtYWlsIjoibmljaG9sYXMuZGhhcm1hZGlAcHJlbWl1bWxpdGhpdW0uY29tIiwiZ2l2ZW5fbmFtZSI6Ik5pY2hvbGFzIiwiZmFtaWx5X25hbWUiOiJEaGFybWFkaSIsIm5hbWUiOiJOaWNob2xhcyBEaGFybWFkaSIsImFtciI6WyJwd2QiXX0.acwqgWCWRnIma2-VJ8swVHC0czo6O0DxbB_wVGJuHu2xnsdAX2g5TtN_Ila-W-u1R3KR50XYEI5K3HSlXhpVAV3zGFSGTmOvcEYK1weIlCY06ArNPwgu2JXl_QCKRXIxOARdyiQhLavYUi_Gglo4cwRYuz6-n2ZESxcLKxJQbtdiRlTummdCrHDryycQreoKzT3L38EXwfavqVuy3OM_Ax2v5I2OWRAqLu7eQzB39EOAdFZONFJkvMFrsyiugxR9V4A6DRns0aHV7UZ6mGASB4sRB5TYHxc6Lq4H_-EBhvbD_PBPH40CMvXhOSOr6geqLkkQcGVhV9YU10xsOZAbIw',
        access_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE2OTgxNjI2MDAsImV4cCI6MTY5ODE2NDQwMCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiNTg1NjY5NjhDNTRCNDAxRjgyODU0RjZDNjMzRTQzQjUiLCJzdWIiOiI4YzNjZTM2N2M2Y2Q1ZmUzYWExZTA2YjYyMGE2Zjk5YSIsImF1dGhfdGltZSI6MTY5ODE2MjU4NiwieGVyb191c2VyaWQiOiJhYTFlMWU3Ni1hNjhlLTRmNGYtOGU1YS1mYWNmN2QzMDUwNWUiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6ImI0ZDNmY2FiMTkxMTRiMGVhZWI3MTk1MTZlZjg0ZjAzIiwic2lkIjoiYjRkM2ZjYWIxOTExNGIwZWFlYjcxOTUxNmVmODRmMDMiLCJqdGkiOiJCRTU3QzM2QzgxQ0Q1QzI4ODY4NzUyOTYxMTNEMjQyMiIsImF1dGhlbnRpY2F0aW9uX2V2ZW50X2lkIjoiMDY3ZTE4MjEtZDNjYS00OWQ0LWExMDEtZmFkODk3NmFmOThlIiwic2NvcGUiOlsiZW1haWwiLCJwcm9maWxlIiwib3BlbmlkIiwiYWNjb3VudGluZy5zZXR0aW5ncy5yZWFkIiwiYWNjb3VudGluZy5hdHRhY2htZW50cyIsImFjY291bnRpbmcudHJhbnNhY3Rpb25zIiwiYWNjb3VudGluZy5jb250YWN0cyIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.knRN-uKcB8bIwxKqYsZ2MEBvQlFHt_YA5_itrGZ7yBHRUpNoBX7ByH5b5kdGnBIl_w-H1CneVPfu1fHXNQ8zt5lhVVi1yp9tUweX_sU3tUAyRcA6bIHxEa8A77Z0f3gkg_HyvjSf7glIeKjbdG2HGWCaDYzIvMn-q3k1efZDvQrO6OinVaQs1uaoTrU0hB6ziHZ9XiQFynFhvEd_0QzWklMBq2DKKYz9Qc_nHvUQqHpfunZzzAvl95gRhVxZM_Frii5WKXts1SxWaS4V8Z6UNV5J2us40XJ3MrusfjITVxEGD8rb3CQEot3DsjvzxBG3hYMNK_P1YIQr8z9YO58gvg',
        expires_in: 1800,
        token_type: 'Bearer',
        refresh_token: 'ii9A-AFVkcRCljzpBtLhzGZe-movCBglzCkojsChVbE',
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

// TO DO - PDF needs to be stored as a file instead of a buffer to be attached to Pipedrive deals. So might need to upload to supabase.
async function attachXeroPDFToDeal(buffer, dealId) {
    try {
        // Store the invoice to static folder temporarily so it can be attached to pipedrive deals (API reads a file and does not like blob objects)
        const filePath = './static/invoice.pdf';

        // Write the Buffer to the file
        fs.writeFileSync(filePath, buffer);

        const pdFilesApi = new pipedrive.FilesApi(pd);
        const addFileRequest = await pdFilesApi.addFile('./static/invoice.pdf', { 'dealId': dealId })

        console.log(addFileRequest)

    } catch (error) {
        console.error("Error attaching PDF to deal:", error)
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

// Type
// Contact
// Line Items
// https://developer.xero.com/documentation/api/accounting/types#invoices
async function createXeroInvoice(activeTenantId) {
    try {
        const dateValue = '2020-10-10'
        const dueDateValue = '2020-10-28'

        const contact: Contact = {
            contactID: "817588c0-b1e5-4e4c-9e2e-3ded7ae9335c" // Choose from contact lists
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
        pl_number: readCustomDealField('PL Number', dealData),
        person_name: dealData.person_name
    }
    return paymentData
}




async function exportXeroInvoiceAsPDF(activeTenantId, invoiceId) {
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
async function getXeroInvoicesFrom(activeTenantId) {
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
function getXeroInvoiceFromRef(invoices, reference) {
    let invoiceFound = []
    for (const i in invoices) {
        if (invoices[i].reference === reference) {
            invoiceFound.push(invoices[i])
        }
    }
    return invoiceFound
}
//Check the authorized tenants (getting the xero-tenant-id)
async function getXeroConnections(token) {
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

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
        await getInspectionsFrom()
        
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

const safetyCultureTemplatesId = {
    'PV, Battery and EV Survey': 'template_ca68194ee1fa4fae98c923fb5e3b4edb',
    'Solar PV & Battery Storage Survey': 'template_6f1eec9f81494d3e96704ddd39739cbe'

}


// SafeCulture API
// Search through all audits (inspections)
// Find and match which audits matches the person_name or PL number (Each Inspections needs a TITLE! and a PL number is attached to it)
// Get the media file (PDF) 
// attach it to pipedrive
async function getInspectionsFrom() {
    const audit_id = "audit_fa3a22f70d89462da2a169dd76864e50"
    /*
    const response = await fetch(`https://api.safetyculture.io/audits/audit_fa3a22f70d89462da2a169dd76864e50`, {
        headers: {
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        }
    })*/
    const response = await fetch(`https://api.safetyculture.io/inspections/v1/inspections/audit_fa3a22f70d89462da2a169dd76864e50`, {
        headers: {
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        }
    })
    const responseData = await response.json()
    const auditsList = responseData.audits
    console.log(responseData)

    await exportInspectionAsPDF(audit_id)
    /*
    //Loop through each audits_data, and find which matches
    for (const i in auditsList) {
        const audit_id = auditsList[i].audit_id
        const response = await fetch(`https://api.safetyculture.io/audits/${audit_id}`, {
            headers: {
                'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
            }
        })
        const responseData = await response.json()
    }*/
}



// API returns download link to PDF
async function exportInspectionAsPDF(inspection_id) {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        },
        body: JSON.stringify({
            type: 'DOCUMENT_TYPE_PDF',
            export_data: [
                {
                    inspection_id: inspection_id,
                }
            ]
        })
    }
    const response = await fetch('https://api.safetyculture.io/inspection/v1/export', options)
    const responseData = await response.json() // returns PDF download link

    const pdfResponse = await fetch(responseData.url) // Make HTTP request to download the file

    // Convert readable stream to buffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(pdfArrayBuffer));
    
    const filePath = './static/site_survey.pdf'; // creates temporary PDF
    fs.writeFileSync(filePath, buffer);
    
    return responseData.url
}
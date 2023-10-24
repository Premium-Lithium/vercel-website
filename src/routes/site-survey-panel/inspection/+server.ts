import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd, readCustomDealField } from '../../../lib/pipedrive-utils.js';
import querystring from 'querystring';
import fs from 'fs';

const SAFETY_CULTURE_TOKEN = 'f5a8b512b90d4ea239858d63f768cdbcdb8cd83c6bd2216001ceb5f20a35632c'

const templates = {
    'PV, Battery and EV Survey - Testing': 'template_c8a5e85ccaf948358be9c7854aed847d'
}

export async function POST({ request }) {
    try {
        const { dealId } = await request.json();

        const dealData = await fetchDealData(dealId);
        const customerData = getCustomerDataFrom(dealData)
        const inspectionRes = await createInspectionFrom(dealData)
        return json(customerData);
    } catch (error) {
        console.log('Error:', error);
        return json({ error: "Can't get dealData" })
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
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// PL Number
// Customer Name
// Property Address
function getCustomerDataFrom(dealData) {
    const customerData = {
        pl_number: readCustomDealField('PL Number', dealData),
        person_name: dealData.person_name,
        property_address: readCustomDealField('Address of Property', dealData)
    }
    return customerData
}

const sectionMapping = {
    'PL Number': '866ec171-9b09-40af-86f1-4dc20fbf2b75',
    'Customer Name': '3f38c167-5a2b-40a5-aa88-329886e7a5ef',
    'Property Address': '7288b6ad-d800-410e-94bb-f52c92fcbf5f'
}

async function createInspectionFrom(dealData) {
    const customerData = getCustomerDataFrom(dealData)

    // Populate PL Number, Customer Name, Property Address
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`
        },
        body: JSON.stringify({
            template_id: 'template_c8a5e85ccaf948358be9c7854aed847d',
            header_items: [
                {
                    type: 'text',
                    responses: { text: customerData.pl_number },
                    item_id: '866ec171-9b09-40af-86f1-4dc20fbf2b75'
                },
                {
                    type: 'text',
                    responses: { text: customerData.person_name },
                    item_id: '3f38c167-5a2b-40a5-aa88-329886e7a5ef'
                },
                {
                    type: 'text',
                    responses: { text: customerData.property_address },
                    item_id: '7288b6ad-d800-410e-94bb-f52c92fcbf5f'
                }
            ]
        })
    }
    try {
        const response = await fetch('https://api.safetyculture.io/audits', options)
        const responseData = await response.json()
        console.log(responseData.response)
        return json({message: 'Success'})
    } catch (error) {
        console.log('Error starting inspection with deal data', error)
        return json({message: 'Error starting inspection with deal data'})
    }
    
}

//https://developer.safetyculture.com/reference/answerservice_getanswersforinspection
async function getInspectionDataFrom() {
    const audit_id = 'audit_b10351eecaf5424aa9b61d5edd01d5e3'

    const response = await fetch(`https://api.safetyculture.io/audits/${audit_id}`, {
        headers: {
            'Authorization': `Bearer ${SAFETY_CULTURE_TOKEN}`,
        }
    })
    const responseData = await response.json()
    console.log(responseData)
}

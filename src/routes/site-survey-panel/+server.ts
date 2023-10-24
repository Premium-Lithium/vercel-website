import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd, readCustomDealField } from '../../lib/pipedrive-utils.js';
import querystring from 'querystring';
import fs from 'fs';

export async function POST({ request }) {
    try {
        const { dealId } = await request.json();

        const dealData = await fetchDealData(dealId);
        const customerData = getCustomerDataFrom(dealData)
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
import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';

import { pd, readCustomDealField, dealFieldsRequest, getKeysForCustomFields } from '../../lib/pipedrive-utils.js';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

const companyDomainFields = 'https://api.pipedrive.com/v1/deals/'

let dealId;
 
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

//
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

//Get data on 

function getPaymentDataFrom(dealData){
    const paymentData = {
        plan: readCustomDealField('Configurator Plan', dealData),
        price: dealData.value
    }
    return paymentData
}
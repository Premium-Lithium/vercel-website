import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';

import { pd, readCustomDealField, dealFieldsRequest, getKeysForCustomFields } from '../../lib/pipedrive-utils.js';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

const companyDomainFields = 'https://api.pipedrive.com/v1/deals/'

let dealId = 7083;

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
updateCustomOption(7083);
async function updateCustomOption(dealId){
    try {
        const pdDealFieldsApi = new pipedrive.DealFieldsApi(pd);
        const dealFieldsRequest = await pdDealFieldsApi.getDealFields();
        const allField = dealFieldsRequest.data;
        console.log("ALL FIELD",allField)
        
        let opts = dealFieldsRequest.FieldUpdateRequest({"Test"})
        console.log("opts", opts)
    } catch (error) {
        console.log("Error")
    }
}

function getChecklistData(dealData) {
    let assignedChecklist = readCustomDealField("Assigned Checklist", dealData);
    let inProgressChecklist = readCustomDealField("In Progress Checklist", dealData);
    let checkListData = {
        assigned: assignedChecklist,
        inProgress: inProgressChecklist
    }
    return checkListData;
}


export async function POST({ request }) {
    try {
        const { dealId } = await request.json();
        const dealData = await fetchDealData(dealId);
        let checklistData = getChecklistData(dealData);

        return json(checklistData);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "Can't get checkListData" })
    }
}
let checkListTemplate = {
    'Assigned Checklist': [
        'Once initial desktop investigation has been completed call client to advise on next steps',
        'Arrange follow up call with client'
    ],
    'In Progress Checklist': [
        'Update Ticket details with outcome of discussion with client',
        'Resolve ticket remotely where possible',
        'Liaise with installer to arrange rectification visit as required',
        'Order any new materials required',
        'Book site visit in with client'
    ]
};



// request = fieldName, data
// GetKeyFrom fieldName
// Use that key to get the actual field
// Update that field value to data (data have to be value options)
export async function PUT({ request }) {
    try {
        const response = await request.json();
        let addRes = getKeysForCustomFields(response)
        addRes = { [addRes[0][0]]: addRes[0][1] }
        const addResponse = await addFieldsForOptions(addRes)
        console.log(addResponse);
        return json(addResponse);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "An error occured" })
    }

}
// Add data to multiple options
// request = fieldName, data
// GetKeyFrom fieldName
// Use that key to get the actual field
// Update that field value to data (data have to be value options)
async function addFieldsForOptions(response) {
    const req = {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
    };
    let res = await fetch(companyDomainFields + dealId + '?api_token=' + PIPEDRIVE_API_TOKEN, req);
    return (new Response(JSON.stringify(await res.json())));
}
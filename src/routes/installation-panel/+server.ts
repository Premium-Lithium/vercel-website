import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';

import { pd, readCustomDealField, dealFieldsRequest, getKeysForCustomFields } from '../../lib/pipedrive-utils.js';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

const companyDomainFields = 'https://api.pipedrive.com/v1/deals/'

let dealId;
// Stage, {Task id, Task label}
const fieldNames = {
    assigned: "Assigned Checklist",
    inProgress: "In Progress Checklist"
}

async function fetchDealData(dealId) {
    try {
        const pdDealsApi = new pipedrive.DealsApi(pd);
        const requestDeal = await pdDealsApi.getDeal(dealId);
        const stageId = requestDeal.data.stage_id
        const stageName = requestDeal.related_objects.stage[stageId].name //Getting the stage name (e.g Assigned)

        if (requestDeal.success) {
            const dealData = requestDeal.data
            return [dealData, stageName];
        } else {
            console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
            return json({ error: 'An error occurred' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error:', error);
        return json({ error: 'An error occurred' }, { status: 500 });
    }
}

function getChecklistData(dealData) {
    let checkListData = {
        assigned: readCustomDealField("Assigned Checklist", dealData),
        inProgress: readCustomDealField("In Progress Checklist", dealData)
    }
    return checkListData;
}


export async function POST({ request }) {
    try {
        const { dealId } = await request.json();
        const dealData = await fetchDealData(dealId);
        let checklistData = getChecklistData(dealData[0]);
        let stageName = dealData[1];

        return json([checklistData, stageName]);
    } catch (error) {
        console.log("Error:", error);
        return json({ error: "Can't get checkListData" })
    }
}
// request = fieldName, data
// GetKeyFrom fieldName
// Use that key to get the actual field
// Update that field value to data (data have to be value options)

// PUT Request Body: {assigned: [{id: , label: }]}
// Convert to Assigned Checklist: [999,1000], In Progress Checklist:[1002,1003]     //for getKeysforCustomFields format
export async function PUT({ request }) {
    try {
        const response = await request.json();
        const propertyName = Object.keys(response)[0];// Extract the property name from response object
        const checklistLabel = fieldNames[propertyName];// Map the property name to the corresponding label using fieldNames
        const idValues = response[propertyName].map(item => item.id);// Extract the id values from the array of objects

        const result = {[checklistLabel]: idValues};
        //console.log(result);
        const addResponse = await updateFieldsForOptions(result, response.dealId);
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
async function updateFieldsForOptions(response, dealId) {
    const keyedData = getKeysForCustomFields(response)
   // console.log(keyedData)
    const req = {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({[keyedData[0][0]]: keyedData[0][1]})
    };
    let res = await fetch(companyDomainFields + dealId + '?api_token=' + PIPEDRIVE_API_TOKEN, req);

    return (new Response(JSON.stringify(res.json())));
}



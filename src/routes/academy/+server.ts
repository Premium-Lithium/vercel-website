import { PIPEDRIVE_API_TOKEN } from "$env/static/private";

let deal = {name: "", email: "", phone: "", academyName: "", companyName: "test", companyAddress: "", person_id: 0, org_id: 0};
const pipedrive = require('pipedrive');
const defaultClient = new pipedrive.ApiClient();
defaultClient.authentications.api_key.apiKey = PIPEDRIVE_API_TOKEN;

async function addDeal() {
    try {
        console.log('Sending request...');

        const data = {
            title: deal.companyName,
            value: 0,
            currency: 'GBP',
            user_id: 14071067,
            person_id: deal.person_id,
            org_id: deal.org_id,
            stage_id: 22,
            status: 'open',
            expected_close_date: '2024-02-11',
            probability: 60,
            lost_reason: null,
            visible_to: 1,
            add_time: new Date().toLocaleString(),
        }
        
        const response = await fetch('https://api.pipedrive.com/api/v1/deals?api_token=77a5356773f422eb97c617fd7c37ee526da11851' {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        console.log('Deal was added successfully!', response);
    } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Adding failed', errorToLog);
    }
}

async function addOrganisation(){
    try {
        console.log('Sending request...');
        //required field(s): name
        const data = {
            name: deal.companyName,
            owner_id: 14071067,
            address: deal.companyAddress,
            visible_to: "3",
            add_time: new Date().toLocaleString()
        }
        const response = await fetch('https://api.pipedrive.com/api/v1/organizations?api_token=77a5356773f422eb97c617fd7c37ee526da11851' {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        deal.org_id = response.data.id;
        console.log('Organization was added successfully', response);
    } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Adding failed', errorToLog);
    }
}

async function addPerson(){
    console.log('Sending request...');
    try{
        //required field(s): name
        const data = {
            name: deal.name,
            owner_id: 14071067,
            email: deal.email,
            phone: deal.phone,
            visible_to: "3",
            add_time: new Date().toLocaleString()
        }
        const response = await fetch('https://api.pipedrive.com/api/v1/persons?api_token=77a5356773f422eb97c617fd7c37ee526da11851' {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        deal.person_id = response.data.id;
        console.log('Person was added successfully', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
            console.log('Adding failed', errorToLog);
        }  
    }

addOrganisation();
addPerson();
addDeal();
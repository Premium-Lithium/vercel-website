import { PIPEDRIVE_API_TOKEN } from "$env/static/private";

async function addNewInstaller(deal){
    const orgId = await addOrganisation(deal);
    const personId = await addPerson(deal);
    await addDeal(deal, orgId, personId);
}

async function addDeal(deal, orgId, personId) {
    try {
        console.log('Sending request...');

        const data = {
            title: deal.companyName,
            value: 0,
            currency: 'GBP',
            user_id: 14071067,
            person_id: personId,
            org_id: orgId,
            stage_id: 159,
            status: 'open',
            expected_close_date: '2024-02-11',
            probability: 60,
            lost_reason: null,
            visible_to: 1,
            add_time: new Date().toLocaleString(),
        }
        
        const response = await fetch(`https://api.pipedrive.com/api/v1/deals?api_token=${PIPEDRIVE_API_TOKEN}` {
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

async function addOrganisation(deal){
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
        const response = await fetch(`https://api.pipedrive.com/api/v1/organizations?api_token=${PIPEDRIVE_API_TOKEN}` {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log('Organization was added successfully', response);
        return response.data.id;
    } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Adding failed', errorToLog);
    }
}

async function addPerson(deal){
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
        const response = await fetch(`https://api.pipedrive.com/api/v1/persons?api_token=${PIPEDRIVE_API_TOKEN}` {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.data.id;
        } catch (err) {
            const errorToLog = err.context?.body || err;
            console.log('Adding failed', errorToLog);
        }  
    }


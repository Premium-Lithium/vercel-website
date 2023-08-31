import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd } from '../../lib/pipedrive-utils.js'

export async function POST({ request }) {
    
    const { deal } = await request.json();
    console.log("deal :", deal);
    addInstaller(deal);
    return json({}, {status: 200})
}


async function addInstaller(deal){
    const orgId = await addOrganisation(deal);
}



async function addDeal(companyName, orgId, personId) {
    try {
        console.log('Sending request...');

        const data = {
            title: companyName,
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
        const dealsApi = new pipedrive.DealsApi(pd);
        const deal = await dealsApi.addDeal(data);
        console.log("dealAdded: ", deal);
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
        const orgApi = new pipedrive.OrganizationsApi(pd);
        const response = await orgApi.addOrganization(data);

        console.log('Organisation was added successfully', response);
        const orgId = response.data.id;
        console.log("orgId = :", orgId);
        await addPerson(deal, orgId);
    } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Adding failed', errorToLog);
    }
}

async function addPerson(deal, orgId){
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
        const personApi = new pipedrive.PersonsApi(pd);
        const response = await personApi.addPerson(data);

        console.log('person was added successfully', response);
        const personId = response.data.id;
        console.log("person Id = ", personId);
        await addDeal(deal.companyName, orgId, personId);
        } catch (err) {
            const errorToLog = err.context?.body || err;

            console.log('Adding failed', errorToLog);
        } 
    }


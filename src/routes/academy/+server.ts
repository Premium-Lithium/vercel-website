import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd } from '$lib/pipedrive-utils.js'


export async function POST({ request }) {
    const { deal } = await request.json();

    const success = addInstaller(deal);

    // todo: use the return code to work out whether the attempt to add the installer was successful

    return json({}, {status: 200})
}


async function addInstaller(deal){
    let addInstallerAttempt = {
        success: true, // todo: adjust the return code based on whether the attempt to add the installer was successful
        message: "Successfully added installer to Pipedrive"
    }

    console.log("Adding organisation");
    const orgId = await addOrganisation(deal.companyName, deal.companyAddress);
    console.log("Organisation ID: " + orgId);

    console.log("Adding person");
    const personId = await addPerson(deal.name, deal.emailAddress, deal.phoneNumber);
    console.log("Person ID: " + personId);

    console.log("Adding deal");
    const dealId = await addDeal(deal.companyName, orgId, personId);
    console.log("Deal ID: " + dealId);
}


async function addOrganisation(companyName, companyAddress) {
    const orgData = {
        name: companyName,
        owner_id: 14071067,
        address: companyAddress,
        visible_to: "3"
    }

    const orgApi = new pipedrive.OrganizationsApi(pd);
    const response = await orgApi.addOrganization(orgData);

    return response.data.id;
}


async function addPerson(name, emailAddress, phoneNumber){
    const personData = {
        name: name,
        owner_id: 14071067, // Rodney
        email: emailAddress,
        phone: phoneNumber,
        visible_to: "3"
    }

    const personApi = new pipedrive.PersonsApi(pd);
    const person = await personApi.addPerson(personData);

    return person.data.id;
}


async function addDeal(companyName, orgId, personId) {
    const dealData = {
        title: companyName,
        user_id: 14071067,
        person_id: personId,
        org_id: orgId,
        stage_id: 159,
        visible_to: 3
    }

    const dealsApi = new pipedrive.DealsApi(pd);
    const deal = await dealsApi.addDeal(dealData);

    // todo: check that the deal was added correctly
    return deal.data.id;
}
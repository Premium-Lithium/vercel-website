import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd } from '$lib/pipedrive-utils.js'


const ACADEMY_MANAGER_PD_USER_ID = 14071067; // Rodney todo: look up pipedrive user id by name
const ACADEMY_PIPELINE_ID = 159; // Academy Pipeline tood: look up pipedrive pipeline id by name


// todo: add endpoint validation

export async function POST({ request }) {
    const installer = await request.json();
    console.log("installer :", installer);

    const installerAddAttempt = await addInstaller(installer);

    const response = new Response(
        JSON.stringify({ message: installerAddAttempt.message }),
        { status: installerAddAttempt.success ? 200 : 500 }
    );

    return response;
}


async function addInstaller(installer) {
    let installerAddAttempt = {
        success: true,
        message: "Successfully added installer to Pipedrive"
    }

    const companyName = installer.companyName;

    const orgId = await addOrganisation(companyName, installer.companyAddress);
    if (orgId === null)
        console.log(`Failed to add Organisation for installer ${companyName}`);

    const personId = await addPerson(installer.name, installer.emailAddress, installer.phoneNumber);
    if (personId === null)
        console.log(`Failed to add Person for installer ${companyName}`);

    const dealAdded = await addDeal(companyName, orgId, personId);

    if (!dealAdded) {
        installerAddAttempt.success = false;
        installerAddAttempt.message = `Failed to add Deal for '${companyName}'`;

        return installerAddAttempt;
    }

    return installerAddAttempt;
}


async function addOrganisation(companyName: string, companyAddress: string): Promise<number | null> {
    const orgData = {
        name: companyName,
        owner_id: ACADEMY_MANAGER_PD_USER_ID,
        address: companyAddress
    }

    const orgApi = new pipedrive.OrganizationsApi(pd);
    const newOrg = await orgApi.addOrganization(orgData);

    if(!newOrg.success) {
        console.log(`Failed to add Organisation '${companyName}' to Pipedrive`);
        return null;
    }

    return newOrg.data.id;
}


async function addPerson(name: string, emailAddress: string, phoneNumber: string): Promise<number | null> {
    const personData = {
        name: name,
        owner_id: ACADEMY_MANAGER_PD_USER_ID, // Rodney
        email: emailAddress,
        phone: phoneNumber
    }

    const personApi = new pipedrive.PersonsApi(pd);
    const newPerson = await personApi.addPerson(personData);

    if(!newPerson.success) {
        console.log(`Failed to add Person for '${name}' to Pipedrive`);
        return null;
    }

    return newPerson.data.id;
}


async function addDeal(companyName: string, orgId: number | null, personId: number | null): Promise<boolean> {
    const dealData = {
        title: companyName,
        user_id: ACADEMY_MANAGER_PD_USER_ID,
        person_id: personId,
        org_id: orgId,
        stage_id: ACADEMY_PIPELINE_ID
    }

    const dealsApi = new pipedrive.DealsApi(pd);

    let addedSuccessfully = true;

    try {
        await dealsApi.addDeal(dealData);
    }
    catch(err) {
        console.log(`Error adding Deal: ${err}`);
        addedSuccessfully = false;
    }

    return addedSuccessfully;
}
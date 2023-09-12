import pipedrive from 'pipedrive';
import { pd, dealFieldsRequest } from '../../lib/pipedrive-utils.js'


async function captureLeadFrom(leadSourceName, lead, labelName=null) { // `labelName` is the name of a pipedrive label
    let result = {
        "success": true,
        "message": `Added new lead to pipedrive.`
    };

    // We only want to add users as leads if they provided their phone number
    if (lead.phoneNumber === undefined) {
        result.message = `Request successfully processed, but no phone number provided so not adding lead.`;
        return result;
    }

    try {
        const leadTitle = `${leadSourceName}: ${lead.name}`; // e.g. "Battery Finder: John Smith"

        const personId = await addPersonToPipedrive(
            lead.emailAddress,
            lead.name,
            lead.phoneNumber,
            lead.ageRange
        );
        await addLeadToPipedrive(leadTitle, lead.source, lead.energyUsage, lead.buildingType, personId, labelName);
    }
    catch(error) {
        const msg = `Error adding lead: ${error}`;
        result.success = false;
        result.message = msg;
        console.log(msg);
    }

    return result;
}


async function addPersonToPipedrive(emailAddress, name, phone, ageRange) {
    console.log(`Adding person ${name} with email ${emailAddress} and phone ${phone} to pipedrive...`);

    const persons = new pipedrive.PersonsApi(pd);

    let person = null;

    try {
        person = await persons.addPerson({
            name: name,
            email: emailAddress,
            phone: phone,
            ownerId: 15215441, // Lewis
            // age: todo: add age field to pipedrive
        });

        console.log(person);
    }
    catch(error) {
        console.log(`Error adding person: ${error}`);
    }

    return person.data.id;
}


async function addLeadToPipedrive(leadTitle, source, energyUsage, buildingType, personId, labelName) {
    console.log(`Adding lead with source ${source}, energy usage ${energyUsage}, building type ${buildingType}, and person id ${personId} to pipedrive...`);

    const leads = new pipedrive.LeadsApi(pd);

    const dailyEnergyUsageFieldId = getFieldId("Daily Energy Usage (kWh)");
    // const leadSourceOtherFieldId = getFieldId("Lead Source - Other");

    try {
        let labels = [];

        if(labelName !== null) {
            const labelId = await getLeadLabelId(labelName);
            labels.push(labelId);
        }

        await leads.addLead({
            title: leadTitle,
            personId: personId,
            ownerId: 15215441, // Lewis
            labelIds: labels,
            [dailyEnergyUsageFieldId]: energyUsage,
            // todo: set custom field for "where did you hear about us?"
            // [leadSourceOtherFieldId]: source
        });
    }
    catch(error) {
        console.log(`Error adding lead: ${error}`);
    }
}


// todo: consider whether these could be moved into pipedrive utils somehow - they're not really specific to this route
async function getLeadLabelId(labelName) {
    const api = new pipedrive.LeadLabelsApi(pd);

    const allLabels = await api.getLeadLabels();
    const label = allLabels.data.find(l => l.name === labelName);

    if(label === undefined) {
        console.log(`Could not find label with name ${labelName}. Is this spelled correctly?`);
        return null;
    }

    return label.id;
}


function getFieldId(fieldName) {
    if(dealFieldsRequest.success === false) {
        console.log(`Could not read deal value for ${fieldName} because deal fields request failed.`);
        return null;
    }

    const allFields = dealFieldsRequest.data;

    const field = allFields.find(f => f.name === fieldName);

    if(field === undefined) {
        console.log(`Could not find deal field with name '${fieldName}'. Is this spelled correctly?`);
        return null;
    }

    return field.key;
}


export { captureLeadFrom };

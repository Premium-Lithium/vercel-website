import pipedrive from 'pipedrive';
import { pd, dealFieldsRequest } from '$lib/pipedrive-utils.js'


async function captureLeadFrom(leadSourceName, lead, labelName=null) { // `labelName` is the name of a pipedrive label
    let result = {
        "success": true,
        "message": `Successfully processed lead.`
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
        );

        await addLeadToPipedrive(
            lead,
            leadTitle,
            personId,
            labelName,
        );
    }
    catch(error) {
        const msg = `Error adding lead: ${error}`;
        result.success = false;
        result.message = msg;
        console.log(msg);
    }

    return result;
}


async function addPersonToPipedrive(emailAddress, name, phone) {
    console.log(`Adding person ${name} with email ${emailAddress} and phone ${phone} to pipedrive...`);

    const persons = new pipedrive.PersonsApi(pd);

    let person = null;

    try {
        person = await persons.addPerson({
            name: name,
            email: emailAddress,
            phone: phone,
            ownerId: 15215441, // Lewis
        });
    }
    catch(error) {
        console.log(`Error adding person: ${error}`);
    }

    return person.data.id;
}


async function addLeadToPipedrive(leadData, title, personId, labelName) {
    const leads = new pipedrive.LeadsApi(pd);

    const dailyEnergyUsageField = getField("Daily Energy Usage (kWh)");
    const homeownerField = getField("Are You the Homeowner?");
    const postcodeField = getField("Post Code")
    const sourceField = getField("How Did You Hear About Us?")

    try {
        let labels = [];

        if(labelName !== null) {
            const labelId = await getLeadLabelId(labelName);
            labels.push(labelId);
        }

        // Work out what to put in the homeowner field - todo: get option id
        const homeownerOptionId = getOptionIdFor(leadData.isHomeOwner, homeownerField);
        const sourceOptionId = getOptionIdFor(leadData.source, sourceField);

        // todo: add information about whether the customer is a homeowner
        let leadOptions = pipedrive.AddLeadRequest.constructFromObject({
            title: title,
            personId: personId,
            ownerId: 15215441, // Lewis
            labelIds: labels,
            [dailyEnergyUsageField.key]: leadData.energyUsage,
            [homeownerField.key]: homeownerOptionId,
            [postcodeField.key]: leadData.postcode
            [sourceField.key]: sourceOptionId

            // todo: set custom field for "where did you hear about us?"
        });

        // Add the lead
        console.log("Adding lead...");
        const newLead = await leads.addLead(leadOptions);

        if(newLead.success === false) {
            console.log(`Error adding lead: ${JSON.stringify(newLead)}`);
            return;
        }

        const newLeadId = newLead.data.id;

        // Add notes to this lead
        console.log("Adding notes...");
        const notes = new pipedrive.NotesApi(pd);

        // While we don't have fields for these, include them in notes
        const noteContent = `Age: ${leadData.ageRange}\nInterested in: ${leadData.interestedIn}\nSource: ${leadData.source || "Unknown"}\nBuilding type: ${leadData.buildingType || "Unknown"}\n Prid: ${leadData.prid || "Unknown"}\n`;

        let noteOptions = pipedrive.AddNoteRequest.constructFromObject({
            content: noteContent,
            leadId: newLeadId
        });

        const newNote = await notes.addNote(noteOptions);
        if(newNote.success === false) {
            console.log("Failed to add note to new lead");
        }
    }
    catch(error) {
        console.log(`Error adding lead: ${JSON.stringify(error)}`);
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


function getField(fieldName) {
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

    return field;
}


function getOptionIdFor(optionName, fieldObject) {
    if (optionName === null) return null // (None) options are encoded as null

    const options = fieldObject.options;
    const option = options.find(o => o.label === optionName);

    if(option === undefined) {
        console.log(`Could not find option with name '${optionName}'. Is this spelled correctly?`);
        return null;
    }

    return option.id;
}


export { captureLeadFrom };

import pipedrive from 'pipedrive';
import { pd, getField, getOptionIdFor } from '$lib/pipedrive-utils.js'


async function captureLeadFrom(leadSourceName, leadData) { // `labelName` is the name of a pipedrive label
    let result = {
        success: true,
        message: `Successfully processed lead.`
    };

    // We only want to add users as leads if they provided their phone number
    if (leadData.phoneNumber === undefined) {
        result.message = "Request successfully processed, but no phone number provided so not adding lead.";
        return result;
    }

    // Add a new Person to pipedrive
    const personId = await addPersonToPipedrive(
        leadData.name,
        leadData.emailAddress,
        leadData.phoneNumber,
        leadData.ageRange
    );

    if(personId === null) {
        result.success = false;
        result.message = "Failed to add Person to Pipedrive.";
        return result;
    }

    // Add a new Deal to pipedrive
    const dealId = await addDealToPipedrive(
        leadData,
        leadSourceName,
        personId,
    );

    if(dealId === null) {
        result.success = false;
        result.message = "Failed to add Deal to Pipedrive.";
        return result;
    }

    return result;
}


async function addPersonToPipedrive(name, emailAddress, phone, ageRange) {
    console.log(`Adding person ${name} with email ${emailAddress} and phone ${phone} to pipedrive...`);

    const persons = new pipedrive.PersonsApi(pd);

    let person = null;

    let personData = {
        name: name,
        email: emailAddress,
        phone: phone,
        ownerId: 15215441 // Lewis
    };

    // If we have age range information
    const personFields = new pipedrive.PersonFieldsApi(pd);
    const allFields = await personFields.getPersonFields();

    let ageFieldExists = false;
    const ageFieldName = "Age";
    if(allFields.success === true) {
        const ageField = allFields.data.find(f => f.name === ageFieldName);

        if(ageField !== undefined) {
            personData[ageField.key] = ageRange;
            ageFieldExists = true;
        }
    }

    const addPersonAttempt = await persons.addPerson(personData);

    if(addPersonAttempt.success === false) {
        console.log(`Error adding person: ${JSON.stringify(person)}`);
        return null;
    }

    const personId = addPersonAttempt.data.id;

    // Add note to Person if the "Age" field is not found
    if(!ageFieldExists) {
        const noteContent = `Could not find person field '${ageFieldName}' to store data: '${ageRange}'.`;

        let noteOptions = pipedrive.AddNoteRequest.constructFromObject({
            content: noteContent,
            personId: personId
        });

        const notes = new pipedrive.NotesApi(pd);
        const newNote = await notes.addNote(noteOptions);

        if(newNote.success === false)
            console.log("Failed to add note to new lead");
    }

    return personId;
}


async function addDealToPipedrive(lead, leadSourceName, personId) {
    // Start by making sure that we always add a deal containing the minimum amount of information
    let data = {
        title: lead.name,
        person_id: personId,
        pipeline_id: 31 // todo: look up the name of the stage on pipedrive
    };

    let noteContent = "";

    // Then add as many custom fields as we have

    // 1. Address
    let fieldName = "Address of Property";
    let leadKeyName = "postcode";
    if(lead[leadKeyName] !== null) {
        const field = getField(fieldName);

        if(field !== null)
            data[field.key] = lead[leadKeyName];
        else
            noteContent += `<b>${fieldName}: ${lead[leadKeyName]}<b><br>`;
    }

    // 2. Lead Source ID
    fieldName = "Lead Source ID";
    leadKeyName = "prid";
    if(lead[leadKeyName] !== null) {
        const field = getField(fieldName);

        if(field !== null)
            data[field.key] = lead[leadKeyName];
        else
            noteContent += `<li><b>${fieldName}: ${lead[leadKeyName]}</b></li><br>`;
    }

    // 3. Lead Source
    fieldName = "Lead Source";
    const field = getField(fieldName);
    if(field !== null)
        data[field.key] = leadSourceName;
    else
        noteContent += `<li><b>${fieldName}: ${leadSourceName}</b></li><br>`;

    // 4. Is homeowner
    fieldName = "Are You the Homeowner?";
    leadKeyName = "isHomeOwner";
    if(lead[leadKeyName] !== null) {
        const field = getField(fieldName);

        if(field !== null) {
            if(field.field_type === "enum") {
                const optionId = getOptionIdFor(lead[leadKeyName], field);
                if(optionId != null)
                    data[field.key] = optionId
                else
                    noteContent += `Could not find option with name '${lead[leadKeyName]}' for field '${fieldName}'.<br>`;
            }
            else
                data[field.key] = lead[leadKeyName];
        }
        else
            noteContent += `<li><b>${fieldName}: ${lead[leadKeyName]}</b><li><br>`;
    }

    // 5. Nature of Enquiry
    fieldName = "Nature of Enquiry";
    leadKeyName = "natureOfEnquiry";
    if(lead[leadKeyName] !== null) {
        const field = getField(fieldName);

        if(field !== null) {
            if(field.field_type === "enum") {
                // map the contents of lead data in lead[leadKeyName] from
                // Prism, Battery Finder e.g "Battery" onto an option in
                // Pipedrive "Battery (Home/Commercial)"
                const pdOptionNameFromLeadInfo = {
                    "Solar Panels": "Solar",
                    "Solar panels and battery": "Battery & Solar",
                    "I'm not sure": "I'm Not Sure"
                };

                // Try to map the info in the lead to an option in pipedrive
                let pdOptionName = pdOptionNameFromLeadInfo[lead[leadKeyName]];

                // If the info provided in the lead data doesn't map to a pipedrive option, then use "Unknown"
                if(pdOptionName === undefined) {
                    pdOptionName = "Unknown";
                    noteContent += `Could not recognise "Nature of Enquiry" option called "${lead[leadKeyName]}", using "Unknown".<br>`;
                }

                // Then work out the option id for the name we found above
                const optionId = getOptionIdFor(pdOptionName, field);
                if(optionId != null)
                    data[field.key] = optionId
                else
                    noteContent += `Could not find option with name '${pdOptionName}' for field '${fieldName}'.<br>`;
            }
            else
                data[field.key] = lead[leadKeyName];
        }
        else
            noteContent += `<li><b>${fieldName}: ${lead[leadKeyName]}</b><li><br>`;
    }

    /* todo: add other fields
    lead.energyUsage
    lead.buildingType
    */

    const dealsApi = new pipedrive.DealsApi(pd);
    const newDeal = await dealsApi.addDeal(data);

    if(newDeal.success === false) {
        console.log(`Error adding deal: ${JSON.stringify(newDeal)}`);
        return null;
    }

    // If there were any fields that we couldn't find, then capture this information in a note
    if(noteContent != "") {
        noteContent = "The following info could not be added to the deal because fields could not be found:<br>" + noteContent;

        let noteOptions = pipedrive.AddNoteRequest.constructFromObject({
            content: noteContent,
            dealId: newDeal.data.id
        });

        const notes = new pipedrive.NotesApi(pd);
        const newNote = await notes.addNote(noteOptions);

        if(newNote.success === false)
            console.log("Failed to add note to new lead");
    }

    return newDeal.data.id;
}


export { captureLeadFrom };

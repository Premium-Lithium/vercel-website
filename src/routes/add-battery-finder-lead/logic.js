import pipedrive from 'pipedrive';
import { pd } from '../../lib/pipedrive-utils.js'


const questions = {
    BUILDING_TYPE: 'are you looking for a battery for your...',
    ENERGY_USAGE: 'how many kwh',
    EMAIL_ADDRESS: 'enter your email address',
    PHONE_NUMBER: 'enter your best contact number',
    NAME: 'what is your name?',
    SOURCE: 'how did you hear about us?'
}


async function createPipedriveLeadFrom(batteryFinderAnswers) {
    let result = {
        "success": true,
        "message": `Added new lead to pipedrive.`
    };

    let getAnswerTo = (question) => {
        const answer = batteryFinderAnswers.find(answer => answer.question_title.toLowerCase().includes(question));

        if(answer === undefined)
            return undefined

        if (answer.choice_label)
            return answer.choice_label;

        else if (answer.values)
            return answer.values[0];
    };

    // We only want to add users as leads if they provided their phone number
    const phoneNumber = getAnswerTo(questions.PHONE_NUMBER);
    console.log(`Phone number: ${phoneNumber}`);

    if (phoneNumber === undefined) {
        result.message = `Request successfully processed, but no phone number provided so not adding lead.`;
        return result;
    }

    let answers = Object.fromEntries(
        Object.entries(questions).map(
            ([name, q]) => [name, getAnswerTo(q)]
        )
    );

    try {
        const name = answers.NAME;
        const personId = await addPerson(answers.EMAIL_ADDRESS, name, answers.PHONE_NUMBER);
        await addLead(answers.SOURCE, answers.ENERGY_USAGE, answers.BUILDING_TYPE, name, personId);
    }
    catch(error) {
        const msg = `Error adding lead: ${error}`;
        result.success = false;
        result.message = msg;
        console.log(msg);
    }

    return result;
}


async function addPerson(emailAddress, name, phone) {
    console.log(`Adding person ${name} with email ${emailAddress} and phone ${phone} to pipedrive...`);

    const persons = new pipedrive.PersonsApi(pd);

    let person = null;

    try {
        person = await persons.addPerson({
            name: name,
            email: emailAddress,
            phone: phone,
            // temp
            ownerId: 15215441 // Lewis
        });
    }
    catch(error) {
        console.log(`Error adding person: ${error}`);
    }

    return person.data.id;
}


async function addLead(source, energyUsage, buildingType, personName, personId) {
    console.log(`Adding lead with source ${source}, energy usage ${energyUsage}, building type ${buildingType}, and person id ${personId} to pipedrive...`);

    const leads = new pipedrive.LeadsApi(pd);

    try {
        await leads.addLead({
            title: `Battery Finder: ${personName}`,
            personId: personId,
            // todo: add custom fields like energy usage here
        });
    }
    catch(error) {
        console.log(`Error adding lead: ${error}`);
    }
}


export { createPipedriveLeadFrom };

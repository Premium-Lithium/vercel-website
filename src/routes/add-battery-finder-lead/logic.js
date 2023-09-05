// todo: import pipedrive stuff here

const question = {
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

    let getDataFor = (question) => {
        const answer = batteryFinderAnswers.find(answer => answer.question_title.toLowerCase().includes(question));

        if(answer === undefined)
            return undefined

        if (answer.choice_label)
            return answer.choice_label;

        else if (answer.values)
            return answer.values[0];
    };

    // We only want to add users as leads if they provided their phone number
    const phoneNumber = getDataFor(question.PHONE_NUMBER);
    console.log(`Phone number: ${phoneNumber}`);

    if (phoneNumber === undefined) {
        result.message = `Request successfully processed, but no phone number provided so not adding lead.`;
        return result;
    }

    const emailAddress = getDataFor(question.EMAIL_ADDRESS);
    const energyUsage = getDataFor(question.ENERGY_USAGE);
    const fullName = getDataFor(question.NAME);
    const source = getDataFor(question.SOURCE);

    return result;
}


export { createPipedriveLeadFrom };

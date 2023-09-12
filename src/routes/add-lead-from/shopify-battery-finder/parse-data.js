// Responsible for converting the data from the Shopify Battery Finder into a known "Lead" format.

// todo: whenever we're using Typescript, import the `Lead` type here and
// specify that `extractLeadFrom` should return an instance of this type

async function extractLeadFrom(batteryFinderRequest) {
    const rawData = await batteryFinderRequest.text();
    const batteryFinderAnswers = JSON.parse(rawData).answers;

    const questions = {
        BUILDING_TYPE: 'are you looking for a battery for your...',
        ENERGY_USAGE: 'how many kwh',
        EMAIL_ADDRESS: 'enter your email address',
        PHONE_NUMBER: 'enter your best contact number',
        NAME: 'what is your name?',
        SOURCE: 'how did you hear about us?'
    }


    let getAnswerTo = (question) => {
        const answer = batteryFinderAnswers.find(answer => answer.question_title.toLowerCase().includes(question));

        if(answer === undefined)
            return undefined

        if (answer.choice_label)
            return answer.choice_label;

        else if (answer.values)
            return answer.values[0];
    };

    let answers = Object.fromEntries(
        Object.entries(questions).map(
            ([name, q]) => [name, getAnswerTo(q)]
        )
    );

    // todo: is it possible to skip the intermediate object and just use the answers object directly?
    const lead = {
        name: answers.NAME,
        emailAddress: answers.EMAIL_ADDRESS,
        phoneNumber: answers.PHONE_NUMBER,
        source: answers.SOURCE,
        energyUsage: answers.ENERGY_USAGE,
        buildingType: answers.BUILDING_TYPE
    };

    return lead;
}


// Responsible for converting the data from Prism into a known "Lead" format.

/*
Example request body

{
    "firstname": "Alex",
    "lastname": "Smith",
    "email": "test@test.com",
    "phone1": "0123456789",
    "postcode": "YO17HF",
    "prid": "01234567",
    "answers": {
        "HomeOwner": "Yes",
        "InterestedIn": "Solar and batteries",
        "Age": "30-40"
    }
}
*/

async function extractLeadFrom(prism) {
    const lead = {
        name: `${prism.firstname} ${prism.lastname}`,
        emailAddress: prism.email,
        phoneNumber: prism.phone1,
        postcode: prism.postcode,
        isHomeOwner: prism.answers.HomeOwner === 'Yes',
        ageRange: prism.answers.Age,
        interestedIn: prism.answers.InterestedIn,
        prid: prism.prid,

        // We're not (yet?) collecting this information from prism
        source: null,
        energyUsage: null,
        buildingType: null
    };

    return lead;
}


export { extractLeadFrom }

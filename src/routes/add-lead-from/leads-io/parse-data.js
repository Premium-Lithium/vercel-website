// Responsible for converting the data from LeadsIO into a known "Lead" format.

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

async function extractLeadFrom(leadsIO) {
    const lead = {
        name: `${leadsIO.firstname} ${leadsIO.lastname}`,
        emailAddress: leadsIO.email,
        phoneNumber: leadsIO.phone1,
        postcode: leadsIO.postcode,
        isHomeOwner: leadsIO.answers.HomeOwner === 'Yes',
        ageRange: leadsIO.answers.Age,
        interestedIn: leadsIO.answers.InterestedIn,

        // We're not (yet?) collecting this information from leadsIO
        source: null,
        energyUsage: null,
        buildingType: null
    };

    return lead;
}


export { extractLeadFrom }

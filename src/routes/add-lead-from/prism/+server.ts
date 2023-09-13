import { json } from '@sveltejs/kit';
import validate from '../../../lib/validation-utils.js';
import { extractLeadFrom } from './parse-data.js';
import { captureLeadFrom } from '../pipedrive-lead-utils.js';


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


const schema = {
    type: "object",
    required: [ "firstname", "lastname", "email", "phone1", "postcode", "prid", "answers" ],
    properties: {
        firstname: {
            "type": "string",
            "errorMessage": "`firstname` should be a string"
        },
        lastname: {
            "type": "string",
            "errorMessage": "`lastname` should be a string"
        },
        email: {
            "type": "string",
            "format": "email",
            "errorMessage": "`email` should be a valid email address"
        },
        phone1: {
            "type": "string",
            "pattern": ".", // todo: add phone number validation regex
            "errorMessage": "`phone` should be a valid phone number"
        },
        postcode: {
            "type": "string",
            "pattern": ".", // todo: add validation regex
            "errorMessage": "`postcode` should be a string"
        },
        prid: {
            "type": "string",
            "pattern": ".", // todo: add validation regex
            "errorMessage": "`prid` should be a string"
        },
        answers: {
            "type": "object",
            "required": [ "HomeOwner", "InterestedIn", "Age" ],
            "errorMessage": "`answers` should be an object containing `HomeOwner`, `InterestedIn` and `Age` properties",
            "properties": {
                HomeOwner: {
                    "type": "string",
                    "enum": [ "Yes", "No" ],
                    "errorMessage": "`HomeOwner` should be either 'Yes' or 'No'"
                },
                InterestedIn: {
                    "type": "string",
                    "enum": [ "Solar panels", "Solar panels and battery" ],
                    "errorMessage": "`InterestedIn` should be either 'Solar panels' or 'Solar panels and battery'"
                },
                Age: {
                    "type": "string",
                    "pattern": ".", // todo: regex validation here
                    "errorMessage": "`Age` should be a string describing an age range e.g '30-40'"
                }
            }
        }
    },
}


export async function POST({ request }) {
    if(!request.body)
        return json({ message: "No request body found" }, { status: 400 });

    const prismData = await request.json();
    const validationErrors = validate(prismData, schema);

    if(validationErrors.length) {
        const message = validationErrors.join(", ");
        return json({ message: `${message}` }, { status: 400 })
    }

    // If the request was as we expected, then use this to create a lead object
    const lead = await extractLeadFrom(prismData);
    const leadAddAttempt = await captureLeadFrom('Prism', lead);

    const response = new Response(
        JSON.stringify({ message: leadAddAttempt.message }),
        { status: leadAddAttempt.success ? 200 : 500 }
    );

    return response;
}
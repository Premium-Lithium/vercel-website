import { json } from '@sveltejs/kit'
import { supabase } from '$lib/supabase.ts'
import validate from '$lib/validation-utils.js'
import { generatePostcardFor } from './logic'

const schema = {
	type: 'object',
	required: ['customerId', 'proposalType'],
	properties: {
		customerId: {
			type: 'string',
			format: 'uuid',
			errorMessage: "'customerId' must be a universally unique identifier according to RFC4122"
		},
		test: {
			type: 'boolean',
			errorMessage: "'test' must be a boolean"
		},
		proposalType: {
			type: 'string',
			enum: ['battery', 'solar'],
			errorMessage: "'proposalType' must be one of 'solar', or 'battery'"
		}
	}
}

export async function POST({ request }) {
	console.log('POST request received');

	if (!request.body) return json({ message: 'No request body found' }, { status: 400 })

	const requestData = await request.json()
	const validationErrors = validate(requestData, schema)

	if (validationErrors.length) {
		const message = validationErrors.join(', ')
		return json({ message: `${message}` }, { status: 400 })
	}

	try {
        // 1. Iterate through the database of customers in the existing solar list
		const { data, error } = await supabase
			.from('existing-solar-properties')
			.select('id, address, audit_flags')

        if(data === null) {
            // todo: handle case where we couldn't find the customer data
        }

		const proposalType: string = 'battery';

		const temp = [ "27 Fylingdale Ave, Rawcliffe, York YO30 5FP, UK", "13 Kitemere Pl, York YO24 2YG, UK", "36 Bellhouse Way, York YO24 3LL, UK", "54 Bellhouse Way, York YO24 3LL, UK", "29 Acomb Wood Cl, Woodthorpe, York YO24 2SN, UK" ]

        const promises = data.map(async (customer) => {
            const customerId = customer.id;
			const address = customer.address.formatted_address;

			if(!temp.includes(address))
				return;

            const auditFlags = customer.audit_flags;

            if (passedAudit(auditFlags)) {
				await generatePostcardFor(customerId, proposalType)
                return true;
            }
            return false;
        });

        const results = await Promise.all(promises);

        const numPostcardsGenerated = results.filter(result => result).length;
		return json({ message: `Generated ${numPostcardsGenerated} audited postcards` }, { status: 200 })
	} catch (error) {
		console.error('Error generating postcard:', error)
		return json({ message: 'Error generating postcard' }, { status: 500 })
	}
}

function passedAudit(auditFlags: Array<number>) {
    // todo: don't hardcode this value
    return auditFlags != null && auditFlags.length === 1 && auditFlags[0] === 99
}
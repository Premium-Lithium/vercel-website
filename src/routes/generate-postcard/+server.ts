import { json } from '@sveltejs/kit'
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
		const customerId: string = requestData.customerId
		const proposalType: string = requestData.proposalType

		generatePostcardFor(customerId, proposalType)

		return json({ message: `${proposalType} postcard generated for customer ${customerId}` }, { status: 200 })

	} catch (error) {
		console.error('Error generating postcard:', error)
		return json({ message: 'Error generating postcard' }, { status: 500 })
	}
}
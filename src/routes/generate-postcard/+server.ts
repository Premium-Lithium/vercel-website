import { json } from '@sveltejs/kit'
import validate from '$lib/validation-utils.js'
import { generatePostcardFor, getCustomerDetailsFor } from './logic'
import { STANNP_API_KEY } from '$env/static/private'

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

		const [postcard, customer] = await Promise.all([
			generatePostcardFor(customerId, proposalType),
			getCustomerDetailsFor(customerId, proposalType)
		])

		// 'test' has to explicitly be set to false in the endpoint to trigger the mailer
		let test = true
		if("test" in requestData)
			test = requestData.test

		const sendAttempt = await sendPostcardTo(customer, postcard, test)

		return sendAttempt
	} catch (error) {
		console.error('Error generating postcard:', error)
		return json({ message: 'Error generating postcard' }, { status: 500 })
	}
}

// todo: type annotations for parameters here
async function sendPostcardTo(customer: any, postcard: any, test: boolean = true) {
	const frontBase64 = postcard.frontImage.toString('base64')
	const backBase64 = postcard.backImage.toString('base64')

	// todo: remove this in production
	// ===============================
	test = true
	console.log("Sending test postcard")
	// ===============================

	const stannpPayload = {
		test,
		size: 'A5',
		front: frontBase64,
		back: backBase64,
		recipient: customer
	}

	// https://www.stannp.com/uk/direct-mail-api/postcards?lang=python
	const response = await fetch(
		'https://dash.stannp.com/api/v1/postcards/create?api_key=' + STANNP_API_KEY,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(stannpPayload)
		}
	)

	return response
}

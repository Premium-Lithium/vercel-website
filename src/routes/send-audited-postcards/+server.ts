import { json } from '@sveltejs/kit'
import { supabase } from '$lib/supabase.ts'
import { STANNP_API_KEY } from '$env/static/private'
import { Buffer } from 'buffer'
import validate from '$lib/validation-utils.js'

const schema = {
	type: 'object',
	required: ['proposalType'],
	properties: {
		proposalType: {
			type: 'string',
			enum: ['battery', 'solar'],
			errorMessage: "'proposalType' must be one of 'solar', or 'battery'"
		}
	}
}


// todo: this type exists in generate-postcard/types.ts, move to shared file
export interface Postcard {
    frontImage: Buffer;
    backImage: Buffer;
}


export interface PostcardRecipient {
    title: string,
    firstname: string,
    lastname: string,
    address1: string,
    address2: string,
    city: string,
    postcode: string,
    country: string
};


export async function POST({ request }) {
	if (!request.body)
        return json({ message: 'No request body found' }, { status: 400 })

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

		const proposalType: string = requestData.proposalType

        const promises = data.map(async (customer) => {
            const id = customer.id;
            const address = customer.address;
            const auditFlags = customer.audit_flags;

            if (passedAudit(auditFlags)) {
                const recipient = createRecipientFrom(address);
                const postcard = await buildPostcardFor(id, proposalType);

                if (postcard == null) {
                    console.log(`Error building postcard for customer ${id}`);
                    return false; // Return false to indicate failure
                }

                await sendPostcardTo(recipient, postcard); // Assuming this is an async function
                return true; // Return true to indicate success
            }
            return false; // Return false if audit fails
        });

        const results = await Promise.all(promises);
        const numPostcardsSent = results.filter(result => result).length;

		return json({ message: `Sent ${numPostcardsSent} audited postcards` }, { status: 200 })
	} catch (error) {
		console.error('Error generating postcard:', error)
		return json({ message: 'Error generating postcard' }, { status: 500 })
	}
}


async function buildPostcardFor(customerId: string, proposalType: string): Promise<Postcard | null> {
    const frontImage = await getFlyerFace(customerId, proposalType, 'front')
    if(frontImage == null)
        console.log(`Error getting front postcard image for customer ${customerId}`);

    const backImage = await getFlyerFace(customerId, proposalType, 'back')
    if(backImage == null)
        console.log(`Error getting back postcard image for customer ${customerId}`);

    if(frontImage == null || backImage == null)
        return null

    return {
        frontImage: frontImage,
        backImage: backImage
    }
}


async function getFlyerFace(customerId: string, proposalType: string, face: string): Promise<Buffer | null> {
    const bucketName = "output-flyer-images"

    const imagePath = `${proposalType}/${customerId}/${face}.png`
    const { data, error } = await supabase.storage.from(bucketName).download(imagePath);

    if(error != null) {
        console.log(`Error downloading ${imagePath} from bucket ${bucketName}: ${error}`);
        return null
    }

    const image = await bufferFromBlob(data);

    return image;
}



// todo: this function already exists in generate-postcard/server.ts, pull it out into a shared file
async function bufferFromBlob(blob: Blob) {
	const streamToBuffer = async (stream) => {
		const chunks = []
		for await (let chunk of stream)
			chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk))

		return Buffer.concat(chunks)
	}

	const buffer: Buffer = await streamToBuffer(blob.stream())

	return buffer
}


function createRecipientFrom(address: any) {
    const splitAddress = splitAddressIntoFields(address['address_components'])

    const recipient = {
        title: 'The',
        firstname: 'Homeowner',
        lastname: '',
        address1: splitAddress.line1,
        address2: splitAddress.line2,
        city: splitAddress.city,
        postcode: splitAddress.postcode,
        country: 'GB'
    }

    return recipient;
}


function splitAddressIntoFields(addressComponents): {
	line1: string
	line2: string
	city: string
	postcode: string
} {
	let fields = { line1: '', line2: '', city: '', postcode: '' }

	addressComponents.forEach((x) => {
		switch (x.types[0]) {
			case 'street_number':
				fields.line1 = x['long_name']
				break
			case 'route':
				fields.line1 = fields.line1.concat(` ${x['long_name']}`)
				break
			case 'locality':
				fields.line2 = x['long_name']
				break
			case 'postal_town':
				fields.city = x['long_name']
				break
			case 'postal_code':
				fields.postcode = x['long_name']
				break
		}
	})
	return fields
}


function passedAudit(auditFlags: Array<number>) {
    // todo: don't hardcode this value
    return auditFlags != null && auditFlags.length === 1 && auditFlags[0] === 99
}


// todo: type annotations for parameters here
async function sendPostcardTo(customer: any, postcard: any, test: boolean = true) {
	console.log(`Sending test postcard to customer at ${customer.address1}, ${customer.address2}`)

	const frontBase64 = postcard.frontImage.toString('base64')
	const backBase64 = postcard.backImage.toString('base64')

	// todo: remove this in production
	// ===============================
	test = true
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

    const data = await response.json()
    console.log(data);

	return response
}
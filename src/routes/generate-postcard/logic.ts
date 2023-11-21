import { supabase } from '$lib/supabase.ts'
import sharp from 'sharp'
import type { Postcard, PostcardRecipient } from './types.ts'
import { Buffer } from 'buffer'
import { createSVGWindow } from 'svgdom'
import { SVG, Svg, Box, Image, registerWindow, namespaces } from '@svgdotjs/svg.js'

export async function generatePostcardFor(customerId: string): Promise<Postcard> {
	const qrCode = await generateQRCode(customerId)
	const front = await createFront(customerId, qrCode)
	const back = await createBack(qrCode)

	return {
		frontImage: front,
		backImage: back
	}
}

async function generateQRCode(customerId: string): Promise<Buffer> {
	let qrCode = await fetch(
		`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vercel-website-liart.vercel.app/solar-proposals/${customerId}`
	)
	qrCode = await qrCode.blob()
	let buffer = await bufferFromBlob(qrCode)
	// handle case where code is not found and return a placeholder image

	return buffer
}

async function getImage(imageName: string): Promise<Buffer | null> {
	const imageData: Blob | null = await fetchPostcardResource(imageName)

	// todo: return a placeholder image if the image data could not be found
	return await bufferFromBlob(imageData)
}

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

async function fetchPostcardResource(name: string): Promise<Blob | null> {
	// const response: any = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60); // public
	const response: any = await supabase.storage.from('postcard-resources').download(name) // private

	const data: Blob = response.data

	if (response.error) {
		console.log(`Error fetching image ${name}: ${response.error}`)
		return null
	}

	return data
}

async function createFront(customerId: string, qrCode: Buffer): Promise<Buffer> {
	const window = createSVGWindow()
	const document = window.document
	registerWindow(window, document)

	// Front of postcard
	const template = await getSvg('flyer-front.svg')
	if (template === null) {
		// todo: handle condition where the template could not be fetched
	}

	// 2. Load the SVG document with the template
	const canvas: Svg = SVG(template)

	const propertyImage = await getPropertyImage(customerId)
	if (propertyImage === null) {
		// todo: handle case where we couldn't fetch the property image
	}

	// 3. Place the property image in the right place
	if (propertyImage !== null) {
		const positionedPropertyImage = await addImageToSvgRegion('#_Bolt_', propertyImage, canvas)
		if (positionedPropertyImage !== null) positionedPropertyImage.back()
	}

	if (qrCode !== null) {
		const positionedQrCode = await addImageToSvgRegion('#_QR_', qrCode, canvas)
		if (positionedQrCode !== null) positionedQrCode.front()
	}

	const openSolarId = await getOpenSolarIdFromCustomerId(customerId)
	if (!openSolarId) {
		console.log("Couldn't find openSolarId")
		return
	}

	const saving = await getSaving(openSolarId)
	const numPanels = await getNumPanels(openSolarId)
	console.log('Saving', saving, 'NumPanels', numPanels)
	if (saving && numPanels) {
		const positionedCustomerInfo = await addTextToSvgRegion(
			'#Customer-info',
			`${numPanels} Solar panels, saving you £${saving}`,
			canvas
		)
		// if (positionedCustomerInfo !== null) positionedCustomerInfo.front()
		console.log(positionedCustomerInfo)
	}

	return canvasToPng(canvas)
}

async function getSaving(openSolarId: number) {
	let res = await fetch(
		'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
		{
			method: 'POST',
			body: JSON.stringify({ openSolarId }),
			headers: { 'Content-Type': 'application/json' }
		}
	)
	if (!res.ok) {
		console.log('Error fetching systems')
		return
	}
	const systems = (await res.json()).systems
	const proposedSaving = systems
		.reduce((p, v, i, a) => {
			return (
				p +
				(v.data.bills.current.bills_yearly[0].annual.total -
					v.data.bills.proposed['213321'].bills_yearly[0].annual.total)
			)
		}, 0)
		.toFixed(2)
	return proposedSaving
}

async function getNumPanels(openSolarId: number) {
	let res = await fetch(
		'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
		{
			method: 'POST',
			body: JSON.stringify({ openSolarId }),
			headers: { 'Content-Type': 'application/json' }
		}
	)
	if (!res.ok) {
		console.log('Error fetching systems')
		return
	}

	let systems = (await res.json()).systems
	const totalPanels = systems.reduce((p, v, i, a) => {
		return p + v.total_module_quantity
	}, 0)

	return totalPanels
}

async function getSvg(svgName: string): Promise<string> {
	const svgData: Blob | null = await fetchPostcardResource(svgName)

	// todo: return placeholder svg text if the svg data could not be found

	const svgString: string = await svgData.text()

	return svgString
}

async function getPropertyImage(customerId: string): Promise<Buffer> {
	const openSolarId = await getOpenSolarIdFromCustomerId(customerId)
	if (!openSolarId) return undefined
	const openSolarSystemUUID = await getOpenSolarSystemUUID(openSolarId)
	if (!openSolarSystemUUID) return undefined

	const url = `https://api.opensolar.com/api/orgs/52668/projects/${openSolarId}/systems/${openSolarSystemUUID}/image/?width=500&height=500`
	const token = 's_SVCFQ5RYUJMFJ46AVCCD2C4SOJ2K5YLN'

	const openSolarResponse = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	})

	if (!openSolarResponse.ok) {
		// todo: handle case where property image is not found - return a placeholder image
		return null
	}

	const screenshot = await openSolarResponse.arrayBuffer()
	const buffer = Buffer.from(screenshot)

	return buffer
}

function addTextToSvgRegion(id: string, text: string, canvas: Svg) {
	let region = canvas.findOne(id)
	if (!region) {
		console.log(`Could not find region with id '${id}'`)
		return null
	}
	console.log(region.node.childNodes[0].childNodes[0])
	region.node.childNodes[0].childNodes[0].data = text
}

async function addImageToSvgRegion(id: string, image: Buffer, canvas: Svg): Promise<Image | null> {
	let region = canvas.findOne(id)
	if (!region) {
		console.log(`Could not find region with id '${id}`)
		return null
	}

	const imageBase64: string = image.toString('base64')

	const regionBoundingBox: Box = region.bbox()
	const dimensions = await getImageDimensions(image) // Assuming imageBuffer is your image data

	const imageType = getImageType(image)
	const placedImage = canvas.image(`data:image/${imageType};base64,${imageBase64}`)

	// Calculate image size by comparing aspect ratios
	const imageAspectRatio = dimensions.width / dimensions.height
	const regionAspectRatio = regionBoundingBox.width / regionBoundingBox.height

	let scaleFactor
	if (imageAspectRatio > regionAspectRatio)
		scaleFactor = regionBoundingBox.height / dimensions.height
	else scaleFactor = regionBoundingBox.width / dimensions.width

	const scaledWidth = dimensions.width * scaleFactor
	const scaledHeight = dimensions.height * scaleFactor

	placedImage.size(scaledWidth, scaledHeight)

	// Center the image
	const xOffset = regionBoundingBox.x + (regionBoundingBox.width - scaledWidth) / 2
	const yOffset = regionBoundingBox.y + (regionBoundingBox.height - scaledHeight) / 2

	placedImage.move(xOffset, yOffset)

	return placedImage
}

async function getImageDimensions(
	image: Buffer
): Promise<{ width: number; height: number } | null> {
	try {
		const metadata = await sharp(image).metadata()
		return {
			width: metadata.width,
			height: metadata.height
		}
	} catch (error) {
		console.error('Error retrieving image metadata:', error)
		return null
	}
}

function getImageType(image: Buffer): string {
	const jpgSignature = Buffer.from([0xff, 0xd8, 0xff])
	const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

	if (image.slice(0, 3).equals(jpgSignature)) return 'jpeg'
	else if (image.slice(0, 8).equals(pngSignature)) return 'png'
	else return 'unknown' // or throw an error, up to your use case
}

async function canvasToPng(canvas: Svg): Promise<Buffer> {
	// SVG.js bug fix: See https://github.com/svgdotjs/svg.js/issues/1285
	canvas.attr('xmlns:svgjs', namespaces.svgjs)

	const outputSvg = canvas.svg()
	const outputPng = await sharp(Buffer.from(outputSvg, 'utf-8'), {
		density: 300 // 300 dpi is considered "print quality"
	})
		.png()
		.toBuffer()

	return outputPng
}

async function createBack(qrCode: Buffer): Promise<Buffer> {
	const window = createSVGWindow()
	const document = window.document
	registerWindow(window, document)

	const backTemplate = await getSvg('flyer-back.svg')
	if (backTemplate === null) {
		// todo: handle condition where the template could not be fetched
	}

	const canvas: Svg = SVG(backTemplate)

	if (qrCode !== null) {
		const positionedQrCode = await addImageToSvgRegion('#_QR_', qrCode, canvas)

		if (positionedQrCode !== null) positionedQrCode.front()
	}

	return canvasToPng(canvas)
}

async function getOpenSolarIdFromCustomerId(customerId: string): Promise<number | undefined> {
	const { data, error } = await supabase
		.from('south_facing_houses')
		.select('*')
		.eq('id', customerId)
	if (error) {
		console.log('Error fetching from south_facing_houses')
		return undefined
	}
	let openSolarIds = data[0]['open_solar_projects'].filter((x) => {
		return x.flags.length == 0
	})
	console.log(openSolarIds)
	return openSolarIds[0].openSolarId
}

async function getOpenSolarSystemUUID(openSolarId: number): Promise<string | undefined> {
	// todo: change url before merge
	const res = await fetch(
		'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
		{
			method: 'POST',
			body: JSON.stringify({ openSolarId }),
			headers: { 'Content-Type': 'application/json' }
		}
	)
	if (!res.ok) {
		console.log('Error fetching systems for openSolar id: ', openSolarId)
		return undefined
	}
	return (await res.json()).systems[0].uuid
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

export async function getCustomerDetailsFor(
	customerId: string
): Promise<PostcardRecipient | undefined> {
	// todo: get customer address information from supabase
	const { data, error } = await supabase
		.from('south_facing_houses')
		.select('address')
		.eq('id', customerId)
	if (error) {
		console.log('Error fetching address from supabase for id: ', customerId)
		return undefined
	}
	let address = splitAddressIntoFields(data[0].address['address_components'])
	return {
		title: 'The',
		firstname: 'Homeowner',
		lastname: '',
		address1: address.line1,
		address2: address.line2,
		city: address.city,
		postcode: address.postcode,
		country: 'GB'
	}
}

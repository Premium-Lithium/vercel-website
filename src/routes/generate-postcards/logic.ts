import { supabase } from '$lib/supabase.ts'
import sharp from 'sharp'
import type { Postcard, PostcardRecipient } from './types.js'
import { Buffer } from 'buffer'
import { createSVGWindow } from 'svgdom'
import { SVG, Svg, Box, Image, registerWindow, namespaces } from '@svgdotjs/svg.js'
import {
	PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN,
	PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
} from '$env/static/public'

let openSolarId: number | undefined

export async function generatePostcardFor(customerId: string, proposalType: string) {
	if(proposalType == 'solar')
		openSolarId = await getOpenSolarIdFromCustomerId(customerId)

	try {
		const route = proposalType == 'solar' ? 'solar' : 'report'
		const landingPageUrl = `https://energiser.ai/${route}?Id=${customerId}`
		const qrCode = await generateQRCodeFor(landingPageUrl);
		const savingsGbp_str = `£${(await getPotentialSavingFor(customerId, proposalType))?.toFixed(0)}`

		const [front, back] = await Promise.all([
			createFront(customerId, qrCode, savingsGbp_str, proposalType),
			createBack(customerId, qrCode, savingsGbp_str, proposalType)
		])

		const postcard: Postcard = {
			frontImage: front,
			backImage: back
		}

		await savePostcardToSupabase(customerId, postcard, proposalType);

		return postcard

	} catch (error) {
		console.error('Error generating postcard:', error)
		throw error
	}
}


async function savePostcardToSupabase(customerId: string, postcard: Postcard, proposalType: string) {
	const publicUrl = await uploadBufferToBucket(postcard.frontImage, `${customerId}/front`, 'output-flyer-images', proposalType)
	console.log(`publicUrl: ${publicUrl}`);

	const { data, error } = await supabase
		.from('existing-solar-properties')
		.update({ 'flyer_front_url': publicUrl })
		.eq('id', customerId)

	uploadBufferToBucket(postcard.backImage, `${customerId}/back`, 'output-flyer-images', proposalType)
}


async function uploadBufferToBucket(buffer: Buffer, fileName: string, bucketName: string, proposalType: string) {
	const filePath = `${proposalType}/${fileName}`
	console.log(filePath);

    let { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

	const justUploaded = await supabase
		.storage
		.from(bucketName)
		.getPublicUrl(filePath)

	console.log(justUploaded.data.publicUrl);

    if (error) {
        console.error('Upload error:', error);
        return false;
    }

    return justUploaded.data.publicUrl
}


async function generateQRCodeFor(url: string): Promise<Buffer> {
	let qrCode = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`)

	qrCode = await qrCode.blob()
	let buffer = await bufferFromBlob(qrCode)
	// handle case where code is not found and return a placeholder image

	return buffer
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

async function getPotentialSavingFor(customerId: string, proposalType: string): Promise<number | undefined>  {
	let proposedSaving = 0;

	if(proposalType == 'solar') {
		// const openSolarId = await getOpenSolarIdFromCustomerId(customerId);

		let res = await fetch(
			'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
			{
				method: 'POST',
				body: JSON.stringify({
					openSolarId,
					openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
				}),
				headers: { 'Content-Type': 'application/json' }
			}
		)
		if (!res.ok) {
			console.log('Error fetching systems')
			return
		}
		const systems = (await res.json()).systems

		proposedSaving = systems
			.reduce((p, v, i, a) => {
				return (
					p +
					(v.data.bills.current.bills_yearly[0].annual.total -
						v.data.bills.proposed['213321'].bills_yearly[0].annual.total)
				)
			}, 0)
		}
	else if(proposalType == 'battery') {
		// todo: read the supabase table to get the savings value for customerId
		const { data, error } = await supabase
			.from('existing-solar-properties')
			.select('potential_savings_with_battery_gbp')
			.eq('id', customerId)

		// todo: handle case where record could not be found
		if(error)
			console.log(error)

		proposedSaving = data[0].potential_savings_with_battery_gbp
	}

	return proposedSaving
}

async function getPotentialNumPanels(openSolarId: number | undefined) {
	let res = await fetch(
		'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
		{
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			}),
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

async function getPropertyImage(customerId: string, proposalType: string): Promise<Buffer | undefined> {
	let buffer: Buffer | undefined

	if(proposalType == 'solar') {
		// const openSolarId: number | undefined = await getOpenSolarIdFromCustomerId(customerId)

		if (!openSolarId)
			return undefined

		const openSolarSystemUUID = await getOpenSolarSystemUUID(openSolarId)
		if (!openSolarSystemUUID) return undefined

		const url = `https://api.opensolar.com/api/orgs/${PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID}/projects/${openSolarId}/systems/${openSolarSystemUUID}/image/?width=500&height=500`
		const token = PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN

		const openSolarResponse = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		})

		if (!openSolarResponse.ok) {
			throw new Error(openSolarResponse.statusText)
		}

		const screenshot = await openSolarResponse.arrayBuffer()
		buffer = Buffer.from(screenshot)
	}
	else if(proposalType == 'battery') {
		// 1. get link from supabse
		const { data, error } = await supabase
			.from('existing-solar-properties')
			.select('screenshot_url')
			.eq('id', customerId)

		// 2. download result
		const screenshotUrl = data[0].screenshot_url

		const supabaseResponse = await fetch(screenshotUrl)

		if (!supabaseResponse.ok)
			throw new Error(supabaseResponse.statusText)

		const screenshot = await supabaseResponse.arrayBuffer()
		buffer = Buffer.from(screenshot)
	}

	return buffer
}

function addTextToSvgRegion(id: string, text: string, canvas: Svg) {
	let region = canvas.findOne(id)
	if (!region) {
		console.log(`Could not find region with id '${id}'`)
		return null
	}
	region.node.childNodes[0].childNodes[0].data = text

	return region.node.childNodes[0].childNodes[0]
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
	else return 'unknown'
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

async function createFront(customerId: string, qrCode: Buffer, savingsGbp_str: string, proposalType: string): Promise<Buffer | undefined> {
	const window = createSVGWindow()
	const document = window.document
	registerWindow(window, document)

	let template
	if(proposalType == 'battery') {
		const frontVariant = 4 // todo: randomly generate this
		template = await getSvg(`battery-proposal-flyer-front-${frontVariant}.svg`);
	}
	else
		template = await getSvg('solar-proposal-flyer-front.svg');

	if (template === null) {
		// todo: handle condition where the template could not be fetched
	}

	const canvas: Svg = SVG(template)

	// Property image
	const propertyImage = await getPropertyImage(customerId, proposalType)

	if (!propertyImage) {
		console.log("can't find property image")
		throw new Error("can't find property image")
	} else {
		const positionedPropertyImage = await addImageToSvgRegion('#BOLT', propertyImage, canvas)

		if (positionedPropertyImage !== null)
			positionedPropertyImage.back()
	}

	// QR Code
	if (!qrCode) {
		console.log("can't find qrcode")
		throw new Error("can't find qrcode")
	} else {
		const positionedQrCode = await addImageToSvgRegion('#QR_CODE', qrCode, canvas)

		if (positionedQrCode !== null)
			positionedQrCode.front()
	}

	// Potential benefits
	const infoTagId = proposalType == 'solar' ? '#SAVING_AND_NUM_PANELS' : '#SAVING'
	let infoContents = savingsGbp_str

	if(proposalType == 'solar') {
		const numPanels = await getPotentialNumPanels(openSolarId)
		infoContents = `${numPanels} solar panels, saving you ${savingsGbp_str}`
	}

	await addTextToSvgRegion(infoTagId, `${infoContents}`, canvas)

	return canvasToPng(canvas)
}

async function createBack(customerId: string, qrCode: Buffer, savingsGbp_str: string, proposalType: string): Promise<Buffer> {
	const window = createSVGWindow()
	const document = window.document
	registerWindow(window, document)

	const template = await getSvg(`${proposalType}-proposal-flyer-back.svg`);
	if (template === null) {
		// todo: handle condition where the template could not be fetched
	}

	const canvas: Svg = SVG(template)

	// Potential savings
	await addTextToSvgRegion('#SAVING', `${savingsGbp_str}`, canvas)

	// Proposal-specific bit for adding potential number of panels to solar proposal
	if(proposalType == 'solar') {
		// QR Code
		if (!qrCode) {
			console.log("can't find qrcode")
			throw new Error("can't find qrcode")
		} else {
			const positionedQrCode = await addImageToSvgRegion('#QR_CODE', qrCode, canvas)

			if (positionedQrCode !== null)
				positionedQrCode.front()
		}

		const numPanels = await getPotentialNumPanels(openSolarId)

		await addTextToSvgRegion('#NUM_PANELS', `${numPanels}`, canvas)
		await addTextToSvgRegion('#NUM_PANELS', `${numPanels} Solar panels`, canvas)
		await addTextToSvgRegion('#SAVING', `saving you ${savingsGbp_str}`, canvas)
		await addTextToSvgRegion('#SAVING_STANDALONE', `${savingsGbp_str} per year!`, canvas)
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
	return openSolarIds[0].openSolarId
}

async function getOpenSolarSystemUUID(openSolarId: number): Promise<string | undefined> {
	// todo: change url before merge
	const res = await fetch(
		'https://vercel-website-liart.vercel.app/solar-proposals/open-solar/get-systems',
		{
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				openSolarOrgId: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			}),
			headers: { 'Content-Type': 'application/json' }
		}
	)
	if (!res.ok) {
		console.log('Error fetching systems for openSolar id: ', openSolarId)
		return undefined
	}
	return (await res.json()).systems[0].uuid
}

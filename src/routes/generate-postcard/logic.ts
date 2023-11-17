import { supabase } from '$lib/supabase.ts';
import sharp from 'sharp';
import type { Postcard, PostcardRecipient } from './types.ts';
import { Buffer } from 'buffer';
import { createSVGWindow } from 'svgdom';
import { SVG, Svg, Box, Image, registerWindow, namespaces } from '@svgdotjs/svg.js';


export async function generatePostcardFor(customerId: string): Promise<Postcard> {
    const qrCode = await generateQRCode(customerId);

    const front = await createFront(customerId, qrCode);
    const back = await createBack(qrCode);

    return {
        frontImage: front,
        backImage: back
    };
}


async function generateQRCode(customerId: string): Promise<Buffer> {
    // todo: generate qr code given customer id
    const qrCode = await getImage('some-qr-code.png');

    // handle case where code is not found and return a placeholder image

    return qrCode;
}


async function getImage(imageName: string): Promise<Buffer | null> {
    const imageData: Blob | null = await fetchPostcardResource(imageName);

    // todo: return a placeholder image if the image data could not be found

    const streamToBuffer = async (stream) => {
        const chunks = [];
        for await (let chunk of stream)
            chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));

        return Buffer.concat(chunks);
    };

    const buffer: Buffer = await streamToBuffer(imageData.stream());

    return buffer;
}


async function fetchPostcardResource(name: string): Promise<Blob | null> {
    // const response: any = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60); // public
    const response: any = await supabase.storage.from('postcard-resources').download(name); // private

    const data: Blob = response.data;

    if(response.error) {
        console.log(`Error fetching image ${name}: ${response.error}`);
        return null;
    }

   return data;
}


async function createFront(customerId: string, qrCode: Buffer): Promise<Buffer> {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    // Front of postcard
    const template = await getSvg('flyer-front.svg');
    if(template === null) {
        // todo: handle condition where the template could not be fetched
    }

    // 2. Load the SVG document with the template
    const canvas: Svg = SVG(template);

    const propertyImage = await getPropertyImage(customerId);
    if(propertyImage === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    // 3. Place the property image in the right place
    if(propertyImage !== null) {
        const positionedPropertyImage = await addImageToSvgRegion("#_Bolt_", propertyImage, canvas);

        if(positionedPropertyImage !== null)
            positionedPropertyImage.back();
    }

    if(qrCode !== null) {
        const positionedQrCode = await addImageToSvgRegion("#_QRCode_", qrCode, canvas);

        if(positionedQrCode !== null)
            positionedQrCode.front();
    }

    return canvasToPng(canvas);
}


async function getSvg(svgName: string): Promise<string> {
    const svgData: Blob | null = await fetchPostcardResource(svgName);

    // todo: return placeholder svg text if the svg data could not be found

    const svgString: string = await svgData.text();

    return svgString;
}


async function getPropertyImage(customerId: string): Promise<Buffer> {
    const url = "https://api.opensolar.com/api/orgs/52668/projects/3341427/systems/3B40614E-903E-4248-ACAC-E87D09E42E31/image/?width=500&height=500";
    const token = "s_SVCFQ5RYUJMFJ46AVCCD2C4SOJ2K5YLN";

    const openSolarResponse = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if(!openSolarResponse.ok) {
        // todo: handle case where property image is not found - return a placeholder image
        return null;
    }

    const screenshot = await openSolarResponse.arrayBuffer();
    const buffer = Buffer.from(screenshot);

    return buffer;
}


async function addImageToSvgRegion(id: string, image: Buffer, canvas: Svg): Promise<Image | null> {
    let region = canvas.findOne(id);
    if (!region) {
        console.log(`Could not find region with id '${id}`);
        return null;
    }

    const imageBase64: string = image.toString('base64');

    const regionBoundingBox: Box = region.bbox();
    const dimensions = await getImageDimensions(image); // Assuming imageBuffer is your image data

    const imageType = getImageType(image);
    const placedImage = canvas.image(`data:image/${imageType};base64,${imageBase64}`);

    // Calculate image size by comparing aspect ratios
    const imageAspectRatio = dimensions.width / dimensions.height;
    const regionAspectRatio = regionBoundingBox.width / regionBoundingBox.height;

    let scaleFactor;
    if (imageAspectRatio > regionAspectRatio)
        scaleFactor = regionBoundingBox.height / dimensions.height;
    else
        scaleFactor = regionBoundingBox.width / dimensions.width;

    const scaledWidth = dimensions.width * scaleFactor;
    const scaledHeight = dimensions.height * scaleFactor;

    placedImage.size(scaledWidth, scaledHeight);

    // Center the image
    const xOffset = regionBoundingBox.x + (regionBoundingBox.width - scaledWidth) / 2;
    const yOffset = regionBoundingBox.y + (regionBoundingBox.height - scaledHeight) / 2;

    placedImage.move(xOffset, yOffset);

    return placedImage;
}


async function getImageDimensions(image: Buffer): Promise<{ width: number, height: number } | null> {
    try {
        const metadata = await sharp(image).metadata();
        return {
            width: metadata.width,
            height: metadata.height
        };
    } catch (error) {
        console.error("Error retrieving image metadata:", error);
        return null;
    }
}


function getImageType(image: Buffer): string {
    const jpgSignature = Buffer.from([0xFF, 0xD8, 0xFF]);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    if (image.slice(0, 3).equals(jpgSignature))
        return 'jpeg';
    else if (image.slice(0, 8).equals(pngSignature))
        return 'png';
    else
        return 'unknown'; // or throw an error, up to your use case
}


async function canvasToPng(canvas: Svg): Promise<Buffer> {
    // SVG.js bug fix: See https://github.com/svgdotjs/svg.js/issues/1285
    canvas.attr('xmlns:svgjs', namespaces.svgjs);

    const outputSvg = canvas.svg();
    const outputPng = await sharp(Buffer.from(outputSvg, 'utf-8'), {
        density: 300 // 300 dpi is considered "print quality"
    }).png().toBuffer();

    return outputPng
}


async function createBack(qrCode: Buffer): Promise<Buffer> {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    const backTemplate = await getSvg('flyer-back.svg');
    if(backTemplate === null) {
        // todo: handle condition where the template could not be fetched
    }

    const canvas: Svg = SVG(backTemplate);

    if(qrCode !== null) {
        const positionedQrCode = await addImageToSvgRegion("#_QRCode_", qrCode, canvas);

        if(positionedQrCode !== null)
            positionedQrCode.front();
    }

    return canvasToPng(canvas);
}


export function getCustomerDetailsFor(customerId: string): PostcardRecipient {
    // todo: get customer address information from supabase

    return {
        title: 'The',
        firstname: 'Homeowner',
        lastname: '',
        address1: '5 Whittam Road, Whalley',
        address2: 'Lancashire',
        city: 'Clitheroe',
        postcode: 'BB7 9SB',
        country: 'GB'
    }
}
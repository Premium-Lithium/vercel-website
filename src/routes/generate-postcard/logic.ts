import { supabase } from '$lib/supabase.ts';
import sharp from 'sharp';
import type { Postcard, PostcardRecipient } from './types.ts';
import { Buffer } from 'buffer';
import { createSVGWindow } from 'svgdom';
import { SVG, Image, registerWindow, namespaces } from '@svgdotjs/svg.js';


export async function generatePostcardFor(customerId: string): Promise<Postcard> {
    const qrCode = await generateQRCode(customerId);

    // Front of postcard
    const frontTemplate = await getSvg('flyer-front.svg');
    if(frontTemplate === null) {
        // todo: handle condition where the template could not be fetched
    }

    const propertyImage_png = await getPropertyImage(customerId);
    if(propertyImage_png === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    const front = await createFront(frontTemplate, propertyImage_png, qrCode);

    // Back of postcard
    const backTemplate = await getSvg('flyer-back.svg');
    if(backTemplate === null) {
        // todo: handle condition where the template could not be fetched
    }

    const back = await createBack(backTemplate, qrCode);

    return {
        frontImage: front,
        backImage: back
    };
}


async function getSvg(svgName: string): Promise<string> {
    const response: any = await supabase.storage.from('postcard-resources').download(svgName); // private
    const svgData: Blob = response.data;
    const svgString: string = await svgData.text();

    return svgString;
}


async function getImage(imageName: string): Promise<Buffer | null> {
    // const response = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60); // public
    const response: any = await supabase.storage.from('postcard-resources').download(imageName); // private

    // todo: handle case where the image has not been found
    if(response.error) {
        console.log(`Error fetching image ${imageName}: ${response.error}`);
        return null;
    }

    const imageData: Blob = response.data;

    const streamToBuffer = async (stream) => {
        const chunks = [];
        for await (let chunk of stream)
            chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));

        return Buffer.concat(chunks);
    };

    const buffer: Buffer = await streamToBuffer(imageData.stream());

    return buffer;
}


export function getCustomerDetailsFor(customerId: string): PostcardRecipient {
    // todo: get customer address information from supabase


    return {
        title: 'Mr',
        firstname: 'Lewis',
        lastname: 'Bowes',
        address1: '5 Whittam Road, Whalley',
        address2: 'Lancashire',
        city: 'Clitheroe',
        postcode: 'BB7 9SB',
        country: 'GB'
    }
}


async function getPropertyImage(customerId: string): Promise<Buffer> {
    // todo: use the open solar api to get the image of the property using the customer's id
    const propertyImage = await getImage('pl-hq.png');

    // todo: handle case where property image is not found

    return propertyImage;
}


async function createFront(template: string, propertyImage: Buffer, qrCode: Buffer): Promise<Buffer> {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    // 2. Load the SVG document with the template
    const canvas = SVG(template);

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

    // SVG.js bug fix: See https://github.com/svgdotjs/svg.js/issues/1285
    canvas.attr('xmlns:svgjs', namespaces.svgjs);

    // 4. Export the result
    const outputSvg = canvas.svg();
    const outputPng = await sharp(Buffer.from(outputSvg, 'utf-8'), {
        density: 300 // 300 dpi is considered "print quality"
    }).png().toBuffer();

    return outputPng
}


async function addImageToSvgRegion(id: string, image: Buffer, canvas): Promise<Image | null> {
    let region = canvas.findOne(id);
    if (!region) {
        console.log(`Could not find region with id '${id}`);
        return null;
    }

    const imageBase64 = image.toString('base64');

    const regionBoundingBox = region.bbox();
    const dimensions = await getImageDimensions(image); // Assuming imageBuffer is your image data

    const placedImage = canvas.image(`data:image/png;base64,${imageBase64}`);

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


async function getImageDimensions(imageBuffer) {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height
        };
    } catch (error) {
        console.error("Error retrieving image metadata:", error);
        return null;
    }
}


async function generateQRCode(customerId: string): Promise<Buffer> {
    // todo: generate qr code given customer id
    const qrCode = await getImage('some-qr-code.png');

    // handle case where code is not found and return a placeholder image

    return qrCode;
}


// todo: type annotation for images here
async function createBack(backTemplate: string, qrCode: Buffer): Promise<Buffer> {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    const canvas = SVG(backTemplate);

    if(qrCode !== null) {
        const positionedQrCode = await addImageToSvgRegion("#_QRCode_", qrCode, canvas);

        if(positionedQrCode !== null)
            positionedQrCode.front();
    }

    canvas.attr('xmlns:svgjs', namespaces.svgjs);
    const outputSvg = canvas.svg();
    const outputPng = await sharp(Buffer.from(outputSvg, 'utf-8'), {
        density: 300 // 300 dpi is considered "print quality"
    }).png().toBuffer();

    return outputPng;
}
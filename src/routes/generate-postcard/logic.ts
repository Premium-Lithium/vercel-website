import { supabase } from '$lib/supabase.ts';
import sharp from 'sharp';
import type { Sharp } from 'sharp';
import type { Postcard, PostcardRecipient } from './types.ts';
import { Buffer } from 'buffer';
import { createSVGWindow } from 'svgdom';
import { SVG, registerWindow, namespaces } from '@svgdotjs/svg.js';


export async function generatePostcardFor(customerId: string): Promise<Postcard> {
    // Front of postcard
    const frontTemplate_svg = await getSvg('postcard-front-new.svg');
    if(frontTemplate_svg === null) {
        // todo: handle condition where the template could not be fetched
    }

    const propertyImage_png = await getPropertyImage_png(customerId);
    if(propertyImage_png === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    const front_png = await createFront_png(frontTemplate_svg, propertyImage_png);

    // Back of postcard
    const backTemplate_png = await getImage('postcard-back.png');
    if(backTemplate_png === null) {
        // todo: handle condition where the template could not be fetched
    }

    const qrCode_png = await generateQRCode_png(customerId);
    const back_png = createBack_png(backTemplate_png, qrCode_png);

    return {
        frontImage: front_png,
        backImage: back_png
    }
}


async function getSvg(svgName: string): string {
    const response: any = await supabase.storage.from('postcard-resources').download(svgName); // private
    const svgData: Blob = response.data;
    const svgString: string = await svgData.text();

    return svgString;
}


async function getImage(imageName: string): Promise<Buffer> {
    // const response = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60); // public
    const response: any = await supabase.storage.from('postcard-resources').download(imageName); // private

    // todo: handle case where the image has not been found

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


async function getPropertyImage_png(customerId: string): Promise<Buffer> {
    console.log("Fetching property image");

    // todo: use the open solar api to get the image of the property using the customer's id
    const propertyImage = await getImage('pl-hq.png');

    return propertyImage;
}


async function createFront_png(template_svg: string, propertyImage_png: Buffer): Promise<Buffer> {
    // 1. Convert the background image to a base64 image
    const propertyImage_base64 = propertyImage_png.toString('base64');

    // 2. Create a new SVG
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    // 3. Load the SVG document with the template
    const canvas = SVG(template_svg);

    // 4. Add the property image to the background of the SVG
    const backgroundImage = canvas.image(`data:image/png;base64, ${propertyImage_base64}`);
    backgroundImage.back();

    // 5. Move the property image to the correct location in the image
    backgroundImage.size('80%', '100%');
    backgroundImage.move('20%', '0%');

    // SVG.js bug fix: See https://github.com/svgdotjs/svg.js/issues/1285
    canvas.attr('xmlns:svgjs', namespaces.svgjs);

    // 6. Export the result
    const outputSvg = canvas.svg();
    const outputPng = await sharp(Buffer.from(outputSvg, 'utf-8'), {
        density: 300 // 300 dpi is considered "print quality"
    }).png().toBuffer();

    return outputPng
}


function generateQRCode_png(customerId: string): Buffer {
    // todo
    return null;
}


// todo: type annotation for images here
function createBack_png(backTemplate_png: any, qrCode_png: any) {
    return backTemplate_png;
}
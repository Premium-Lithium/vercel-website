import { supabase } from '$lib/supabase.ts';
import sharp from 'sharp';
import type { Sharp } from 'sharp';
import type { Postcard, PostcardRecipient } from './types.ts';
import { Buffer } from 'buffer';


export async function generatePostcardFor(customerId: string): Promise<Postcard> {
    // Front of postcard
    const frontTemplate_png = await getTemplate_png('postcard-front.png');
    if(frontTemplate_png === null) {
        // todo: handle condition where the template could not be fetched
    }

    const propertyImage_png = await getPropertyImage_png(customerId);
    if(propertyImage_png === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    const front_png = await createFront_png(frontTemplate_png, propertyImage_png);

    // Back of postcard
    const backTemplate_png = await getTemplate_png('postcard-back.png');
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


async function getTemplate_png(pngName: string): Promise<Buffer> {
    // const response = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60); // public
    const response: any = await supabase.storage.from('postcard-resources').download(pngName); // private

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
    const propertyImage = await getTemplate_png('pl-hq.png');

    return propertyImage;
}


async function createFront_png(template_png: Buffer, propertyImage_png: Buffer): Promise<Buffer> {
    try {
        const propertyImage: Sharp = sharp(propertyImage_png);
        const templateImage: Sharp = sharp(template_png);

        const combined: Buffer = await templateImage.composite([{
            input: await propertyImage.toBuffer(),
            blend: 'dest-over'
        }]).toBuffer();

        return combined;
    } catch (error) {
        console.error('Error during image merging:', error);
        return null;
    }
}


function generateQRCode_png(customerId: string): Buffer {
    // todo
    return null;
}


// todo: type annotation for images here
function createBack_png(backTemplate_png: any, qrCode_png: any) {
    return backTemplate_png;
}
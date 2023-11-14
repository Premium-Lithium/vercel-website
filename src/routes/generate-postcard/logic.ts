import { supabase } from '$lib/supabase.ts';


export async function generatePostcardFor(customerId: string) {
    const template_png = await downloadTemplate_png();
    if(template_png === null) {
        // todo: handle condition where the template could not be fetched
    }

    const propertyImage_png = await getPropertyImage_png(customerId);
    if(propertyImage_png === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    const postcard_png = combine(template_png, propertyImage_png);

    // 2. Use the customerId to get the customer's address
    // todo

    return {
        front: postcard_png,
        back: postcard_png
    }
}


async function downloadTemplate_png() {
    console.log("Downloading template png");

    // const response = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60);
    const response = await supabase.storage.from('postcard-resources').download('postcard-template.png');

    const template_png = response.data;
    if(template_png === null) {
        console.log("Template was null: ", response.error);
    }

    return template_png;
}


async function getPropertyImage_png(customerId: string) {
    console.log("Fetching property image");
    let propertyImage = null;

    // todo:

    return propertyImage;
}


function combine(template_png: any, propertyImage_png: any) {
    console.log("Merging results");
    // Returns a png image containing the result of adding the property image to the template
    let combined = null;

    combined = template_png;

    // todo:

    return combined;
}
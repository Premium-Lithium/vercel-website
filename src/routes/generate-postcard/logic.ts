import { supabase } from '$lib/supabase.ts';


export async function generatePostcardFor(customerId: string) {
    const template_png = downloadTemplate_png();
    if(template_png === null) {
        // todo: handle condition where the template could not be fetched
    }

    const propertyImage_png = getPropertyImage_png(customerId);
    if(propertyImage_png === null) {
        // todo: handle case where we couldn't fetch the property image
    }

    // At this point we've got the template image for the front of the
    // postcard along with the image of the customer's property
    const postcard_png = combine(template_png, propertyImage_png);

    // 2. Use the customerId to get the customer's address
    // todo

    return {
        postcard_png: postcard_png
    }
}


async function downloadTemplate_png() {
    const response = await supabase.storage.from('postcard-resources').createSignedUrl('postcard-template.png', 60);

    if(response.error)
        // todo
        return null;

    const template_png = response.data;
    return template_png;
}


async function getPropertyImage_png(customerId: string) {
    let propertyImage = null;

    // todo:

    return propertyImage;
}


function combine(template_png: any, propertyImage_png: any) {
    // Returns a png image containing the result of adding the property image to the template
    let combined = null;

    // todo:

    return combined;
}
import { PIPEDRIVE_API_TOKEN } from "$env/static/private"
import fetchAllPaginated from "$lib/pipedrive/fetchAllPaginated"
import { supabase } from "$lib/supabase"
import { extractPostcodeFromAddress } from "$lib/services/postcodeUtilities"

export async function sync() {
    console.log("syncing")
    const installerData = await getInstallerDataFromPipedrive()
    installerData.forEach(async (installer) => {
        const { data, error } = await supabase
            .from("installers")
            .upsert({
                id: installer.id,
                name: installer.name,
                address: installer.address,
                postcode: extractPostcodeFrom(address),
            })
    })
    

    // Fill empty postcodes
}

async function getInstallerDataFromPipedrive() {
    const installerData = await fetchAllPaginated({
        url: "https://api.pipedrive.com/api/v1/organizations",
        queryParams: [
            `api_token=${PIPEDRIVE_API_TOKEN}`,
            `filter_id=115`,
        ]
    });

    return installerData
}




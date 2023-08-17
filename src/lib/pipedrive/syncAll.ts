import { PIPEDRIVE_API_TOKEN } from "$env/static/private"
import fetchAllPaginated from "$lib/pipedrive/fetchAllPaginated"
import { adminSupabase } from "$lib/supabase"
import { extractPostcodeFrom } from "$lib/services/postcodeUtils"

export async function sync() {
    console.log("syncing")
    const installerData = await getInstallerDataFromPipedrive()
    installerData.forEach(async (installer) => {
        const { data, error } = await adminSupabase
            .from("installers")
            .upsert({
                id: installer.id,
                name: installer.name,
                address: installer.address,
                postcode: extractPostcodeFrom(installer.address),
            })
        console.log(error)
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




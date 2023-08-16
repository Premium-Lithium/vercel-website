import { PIPEDRIVE_API_TOKEN } from "$env/static/private"
import fetchAllPaginated from "$lib/pipedrive/fetchAllPaginated"
import supabase from "$lib/supabase"

export async function sync() {
    console.log("syncing")
    const installerData = getInstallerDataFromPipedrive()
    

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

    console.log(installerData)
}




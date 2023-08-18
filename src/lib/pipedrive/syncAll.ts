import { syncInstallers } from "$lib/pipedrive/syncInstallers"
import { syncJobs } from "$lib/pipedrive/syncJobs"
import { syncInstallerPostcodes } from "$lib/pipedrive/syncInstallerPostcodes"
import { syncJobPostcodes } from "$lib/pipedrive/syncJobPostcodes"

export async function syncAll() {
    console.log("syncing")

    //await syncInstallers()
    console.log("done syncing installers")
    await syncInstallerPostcodes()
    console.log("done syncing installer postcodes")
    //await syncJobs()
    console.log("done syncing jobs")
    //await syncJobPostcodes()
    console.log("done syncing job postcodes")

    

    // Fill empty postcodes
}



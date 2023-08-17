import { syncInstallers } from "$lib/pipedrive/syncInstallers"
import { syncJobs } from "$lib/pipedrive/syncJobs"

export async function syncAll() {
    console.log("syncing")

    await syncInstallers()
    console.log("done syncing installers")
    //await fillInstallerPostcodes()
    await syncJobs()
    //await fillJobPostcodes()
    console.log("done syncing jobs")

    

    // Fill empty postcodes
}



import { getBatchLatLonFromPostcodesWrapper } from "$lib/services/postcodeUtils"
import { adminSupabase } from "$lib/adminSupabase"

export async function syncJobPostcodes() {
    // Get list of installers with address but no postcode
    const { data: jobsWithoutLocation, error } = await adminSupabase
        .from("jobs")
        .select("id, postcode")
        .not("postcode", "is", null)
        .is("latitude", null)

    const postcodeToIdMap = new Map(
        jobsWithoutLocation.map((job) => [job.postcode, job.id])
    )

    const ids = Array.from(postcodeToIdMap.values())
    const postcodes = Array.from(postcodeToIdMap.keys())
    const postcodeToLocationMap = await getBatchLatLonFromPostcodesWrapper(postcodes)
    const postcodesWithLocations = Object.keys(postcodeToLocationMap)

    // Insert location for all jobs with postcodes
    await Promise.all(
        postcodesWithLocations.map(async (postcode) => {
            const id = postcodeToIdMap.get(postcode)
            const { latitude, longitude } = postcodeToLocationMap[postcode]

            const { error } = await adminSupabase
                .from("jobs")
                .update({
                    latitude: latitude,
                    longitude: longitude,
                })
                .eq("id", id)

        }
    ))
}


import { getBatchLatLonFromPostcodesWrapper } from "$lib/services/postcodeUtils"
import { adminSupabase } from "$lib/supabase"

export async function syncInstallerPostcodes() {
    // Get list of installers with address but no postcode
    const { data: installersWithoutLocation, error } = await adminSupabase
        .from("installers")
        .select("id, postcode")
        .not("postcode", "is", null)
        .is("latitude", null)

    const postcodeToIdMap = new Map(
        installersWithoutLocation.map((installer) => [installer.postcode, installer.id])
    )

    const ids = Array.from(postcodeToIdMap.values())
    const postcodes = Array.from(postcodeToIdMap.keys())
    const postcodeToLocationMap = await getBatchLatLonFromPostcodesWrapper(postcodes)
    const postcodesWithLocations = Object.keys(postcodeToLocationMap)

    await Promise.all(
        postcodesWithLocations.map(async (postcode) => {
            const id = postcodeToIdMap.get(postcode)
            const { latitude, longitude } = postcodeToLocationMap[postcode]

            const { error } = await adminSupabase
                .from("installers")
                .update({
                    latitude: latitude,
                    longitude: longitude,
                })
                .eq("id", id)

        }
    ))
}


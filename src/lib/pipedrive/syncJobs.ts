import { PIPEDRIVE_API_TOKEN } from "$env/static/private"
import fetchAllPaginated from "$lib/pipedrive/fetchAllPaginated"
import { adminSupabase } from "$lib/adminSupabase"
import { extractPostcodeFrom } from "$lib/services/postcodeUtils"

export async function syncJobs() {
    const jobData = await getJobDataFromPipedrive()
    jobData.forEach(async (job) => {
        const address = job["b26fd49521a6b948ba52ffd45566f7a229b3c896"]
        const { data, error } = await adminSupabase
            .from("jobs")
            .upsert({
                id: job.id,
                name: job.name,
                address: address,
                postcode: extractPostcodeFrom(address),
            })
    })
}

async function getJobDataFromPipedrive() {
    const jobData = await fetchAllPaginated({
        url: "https://api.pipedrive.com/api/v1/persons",
        queryParams: [
            `api_token=${PIPEDRIVE_API_TOKEN}`,
            `filter_id=127`,
        ]
    });

    return jobData
}


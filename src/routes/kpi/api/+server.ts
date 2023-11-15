import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import pipedrive from 'pipedrive';

// leads are in custom fields
const sourceMappings = {  // specify which lead source strings correspond to which lead type

}

const pd = new pipedrive.ApiClient();
let apiToken = pd.authentications.api_key;
apiToken.apiKey = process.env.PIPEDRIVE_API_TOKEN;

const leadsApi = new pipedrive.LeadsApi(pd);
const leadSourcesApi = new pipedrive.LeadSourcesApi(pd);
let opts = {
    limit: 1000,
    start: 0,
}

export async function POST({ request }: RequestEvent) {
    
    
    const getLeads = async function (opts) {
        return await leadsApi.getLeads(opts)
    }
    const allLeads = await fetchAllPaginated(getLeads, opts)
    const leadSources = await getLeadSources();
    return json(leadSources)
    return json("error")
}


async function getLeadSources() {
    const res = await leadSourcesApi.getLeadSources(opts)
    return res
}


async function fetchAllPaginated(func: Function, opts: {limit?: number, start?: number}) {
    let results = [];
    while (true) { 
        let res = await func(opts)
        results.push(...res.data)
        if (res.additional_data.pagination.more_items_in_collection) {
            opts.start = res.additional_data.pagination.next_start;
        } else {
            return results;
        }
    }
}
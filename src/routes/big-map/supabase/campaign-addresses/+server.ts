import { supabase } from "$lib/supabase";
import type { MapResponse } from "../../bm-stores";

// Gets all the campaign IDs and names 
export async function POST({ request }) {
    let req = await request.json()

    let res = await getAddressForCampaign(req)

    return new Response(JSON.stringify(res))
}

async function getAddressForCampaign(campaign: string): Promise<MapResponse> {
    let { data, error } = await supabase
        .from('campaign_customers')
        .select('fullAddress: address_formatted, address, currentStatus: current_status, customerId: customer_id')
        .eq('campaign_id', campaign)

    if (error) {
        console.log(error)
        return { ok: false, message: "Failed to retrieve details for campaign " + campaign, statusCode: 400, body: error }
    }
    return { ok: true, message: "Retrieved campaign address for campaign " + campaign, statusCode: 200, body: data }
}
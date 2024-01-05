import { supabase } from "$lib/supabase";
import type { MapResponse } from "../../bm-stores";

// Gets all the campaign IDs and names 
export async function GET() {
    let res = await getIdAndName()

    return new Response(JSON.stringify(res))
}

async function getIdAndName(): Promise<MapResponse> {
    let { data, error } = await supabase
        .from('campaign_master')
        .select('id: campaign_id, name: campaign_name')

    if (error) {
        console.log(error)
        return { ok: false, message: "Failed to retrieve campaign names and ids", statusCode: 400, body: error }
    }
    return { ok: true, message: "Retrieved campaign names and ids", statusCode: 200, body: data }
}
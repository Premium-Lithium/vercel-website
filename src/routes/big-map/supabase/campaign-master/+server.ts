import { supabase } from "$lib/supabase";

// Gets all the campaign IDs and names 
export async function GET() {

    let { data: campaign_master, error } = await supabase
        .from('campaign_master')
        .select('*')

    console.log("Data: ", campaign_master)
    console.log("Error: ", error)

    return new Response()
}
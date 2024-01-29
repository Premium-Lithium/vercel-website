import { supabase } from "$lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .storage
        .from('big-map-data')
        .download('installers.csv')
    if (data) {
        return new Response(JSON.stringify({data: await data.text()}))
    }
    return new Response(JSON.stringify(error))
}
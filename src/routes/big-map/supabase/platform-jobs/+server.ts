import { supabase } from "$lib/supabase";

// Gets all quotes
export async function GET(): Promise<Response> {
    let { data, error } = await supabase
        .from('platform_jobs')
        .select("*")
    if (error) 
        return new Response(JSON.stringify({ ok: false, body: error}))
    return new Response(JSON.stringify({ ok: true, body: data }))
}
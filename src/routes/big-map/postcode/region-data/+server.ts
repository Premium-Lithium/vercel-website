import { supabase } from "$lib/supabase"

export async function POST({ request }) {
    const kmlFile = await request.json()
    const { data, error } = await supabase
        .storage
        .from('postcode-kml')
        .download(kmlFile)
    let kmlString = await data?.text()
    if (kmlString)
        return new Response(JSON.stringify(kmlString))
    return new Response(JSON.stringify(""))
}
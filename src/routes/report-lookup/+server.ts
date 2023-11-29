import { supabase } from "$lib/supabase"

export async function POST ({ request }) {
    const uuid: string = await request.json()

    let { data, error } = await supabase
        .from('existing-solar-properties')
        .select('*')
        .eq('id', uuid)
    if (data) {
        return new Response(JSON.stringify(data[0]))
    }
    return new Response(JSON.stringify(error))
}
// Creates a layer for each postcode region in the UK
// List all files in the bucket
// Go through each file and:
//  get the name
//  get the file
//  create an object of {name, layer string}
//  add to an array
// return array

import { supabase } from "$lib/supabase"

export async function GET() {
    const { data, error } = await supabase
        .storage
        .from('postcode-kml')
        .list('', { limit: 125, offset: 0 })
    if (data) {
        return new Response(JSON.stringify(data))
    }
    return new Response(JSON.stringify(error))
}
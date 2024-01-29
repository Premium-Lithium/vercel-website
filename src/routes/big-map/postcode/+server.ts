// Creates a layer for each postcode region in the UK
// List all files in the bucket
// Go through each file and:
//  get the name
//  get the file
//  create an object of {name, layer string}
//  add to an array
// return array

import { supabase } from "$lib/supabase"
import type { PostcodeFilterElement } from "../bm-stores"

export async function GET() {
    let layerArr: Array<{name: string, kml: string}> = []

    const { data, error } = await supabase
        .storage
        .from('postcode-kml')
        .list('', {limit: 125, offset: 0})
    if (data) {
        for (let file in data) {
            let postcodeString: string = await createLayerFor(data[file].name)
            if (postcodeString !== "")
                layerArr.push({name: data[file].name.slice(0, -4), kml: postcodeString})
        }
    }
    console.log(layerArr)
    return new Response(JSON.stringify({ok: true, body: layerArr}))
}

async function createLayerFor(kmlFile: string): Promise<string> {
    const tempDir = '/temp-kml.kml'
    const { data, error } = await supabase
        .storage
        .from('postcode-kml')
        .download(kmlFile)
    let kmlString = await data?.text()
    if (kmlString)
        return kmlString
    return ""
}
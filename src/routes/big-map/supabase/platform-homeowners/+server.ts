import { supabase } from "$lib/supabase";
import type { PlatformHomeowner } from "../../bm-stores";

// Get all installer and homeowner data
export async function GET(): Promise<Response> {
    let homeownerData = await getHomeownerData()
    if (homeownerData.ok) {
        return new Response(JSON.stringify({ ok: true, homeowners: homeownerData.body }))
    } else {
        return new Response(JSON.stringify({ ok: false }))
    }
}

async function getHomeownerData(): Promise<{ ok: boolean, body: PlatformHomeowner | any }> {
    let { data, error } = await supabase
        .from('platform_homeowners')
        .select('*')
        .eq('internal', false)
    if (error)
        return { ok: false, body: error }
    if (data) {
        for (let homeowner of data) {
            if (!(homeowner.lat_lon)) {
                homeowner.lat_lon = await getLatLongFromAddress(homeowner.address + " " + homeowner.postcode)
                if (homeowner.lat_lon)
                    await addLatLongToDatabase(homeowner)
            }
        }
    }
    return { ok: true, body: data }
}

async function addLatLongToDatabase(homeowner: PlatformHomeowner) {
    let { data, error } = await supabase
        .from('platform_homeowners')
        .update({ lat_lon: homeowner.lat_lon })
        .eq('id', homeowner.id)
    if (error) {
        console.log(error)
    }
}

async function getLatLongFromAddress(address: string) {
    let req = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
        { method: 'GET' }
    )
    let res = await req.json()
    console.log(res)
    if (res.status !== 'ZERO_RESULTS')
        return res.results[0].geometry.location
    return null
}
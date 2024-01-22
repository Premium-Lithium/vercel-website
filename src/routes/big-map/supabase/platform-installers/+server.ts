import { supabase } from "$lib/supabase";
import type { PlatformInstaller } from "../../bm-stores";

// Get all installer and homeowner data
export async function GET(): Promise<Response> {
    let installerData = await getInstallerData()
    if (installerData.ok) {
        return new Response(JSON.stringify({ ok: true, installers: installerData.body }))
    } else {
        return new Response(JSON.stringify({ ok: false }))
    }
}

async function getInstallerData(): Promise<PlatformInstaller | any> {
    let { data, error } = await supabase
        .from('platform_installers')
        .select('*')
        .eq('internal', false)
    if (error)
        return { ok: false, body: error }
    if (data) {
        for (let installer of data) {
            if (!(installer.lat_lon)) {
                installer.lat_lon = await getLatLongFromAddress(installer.address + " " + installer.postcode)
                await addLatLongToDatabase(installer)
            }
        }
    }
    return { ok: true, body: data }
}

async function addLatLongToDatabase(installer: PlatformInstaller) {
    let { data, error } = await supabase
        .from('platform_installers')
        .update({ lat_lon: installer.lat_lon })
        .eq('id', installer.id)
    if (error) {
        console.log(error)
    }
}

async function getLatLongFromAddress(address: string) {
    let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
        { method: 'GET' }
    )
    return (await res.json()).results[0].geometry.location
}
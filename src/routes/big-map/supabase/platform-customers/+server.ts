import { supabase } from "$lib/supabase";

// Get all installer and homeowner data
export async function GET() {
    let installerData = await getInstallerData()
    let homeownerData = getHomeownerData()
}

async function getInstallerData(): Promise<any> {
    
    return
}

async function getHomeownerData(): Promise<any> {
    return
}
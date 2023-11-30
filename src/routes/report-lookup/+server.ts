import { supabase } from "$lib/supabase"

export async function POST({ request }) {
    const req = await request.json()
    if (req.option === 0) {
        let { data, error } = await supabase
            .from('existing-solar-properties')
            .select('*')
            .eq('id', req.uuid)
        if (data) {
            return new Response(JSON.stringify(data[0]))
        }
        return new Response(JSON.stringify(error))
    } else {
        let { data, error } = await supabase
            .from('campaign_customers')
            .select('analytics')
            .eq('customer_id', req.uuid)
        if (error)
            return new Response(JSON.stringify(error))
        let currAnalytics = data
        console.log(data)
        if (currAnalytics === null) {
            currAnalytics = {
                scannedQrCode: false,
                consented: false,
                bookedConsultation: false,
            }
        }
        switch (req.analyticStage) {
            case 0:
                return new Response(JSON.stringify(await updateScannedQrCode(req.uuid, currAnalytics)))
            case 1:
                return new Response(JSON.stringify(await consentedToAnalytics(req.uuid, currAnalytics)))
            case 2:
                return new Response(JSON.stringify(await bookedConsultationAnalytics(req.uuid, currAnalytics)))
        }
    }
}

async function updateScannedQrCode(uuid: string, currAnalytics) {
    currAnalytics.scannedQrCode = true
    let { data, error } = await supabase
        .from('existing-solar-properties')
        .update({ analytics: currAnalytics })
        .eq('customer_id', uuid)
    if (error)
        return error
    return data
}

async function consentedToAnalytics(uuid: string, currAnalytics) {
    currAnalytics.consented = true
    let { data, error } = await supabase
        .from('existing-solar-properties')
        .update({ analytics: currAnalytics })
        .eq('customer_id', uuid)
    if (error)
        return error
    return data
}

async function bookedConsultationAnalytics(uuid: string, currAnalytics) {
    currAnalytics.bookedConsultation = true
    let { data, error } = await supabase
        .from('existing-solar-properties')
        .update({ analytics: currAnalytics })
        .eq('customer_id', uuid)
    if (error)
        return error
    return data
}
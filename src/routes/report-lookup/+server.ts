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
            .from('existing-solar-properties')
            .select('analytics')
            .eq('id', req.uuid)
        if (error)
            return new Response(JSON.stringify(error))
        let currAnalytics;
        if (data[0].analytics === null) {
            currAnalytics = {}
            currAnalytics.scannedQrCode = false;
            currAnalytics.consented = false;
            currAnalytics.bookedConsultation = false;
        } else {
            currAnalytics = data[0].analytics
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
        .eq('id', uuid)
    if (error) {
        console.log(error)
        return error
    }
    return data
}

async function consentedToAnalytics(uuid: string, currAnalytics) {
    currAnalytics.consented = true
    let { data, error } = await supabase
        .from('existing-solar-properties')
        .update({ analytics: currAnalytics })
        .eq('id', uuid)
    if (error) {
        console.log(error)
        return error
    }
    return data
}

async function bookedConsultationAnalytics(uuid: string, currAnalytics) {
    currAnalytics.bookedConsultation = true
    let { data, error } = await supabase
        .from('existing-solar-properties')
        .update({ analytics: currAnalytics })
        .eq('id', uuid)
    if (error) {
        console.log(error)
        return error
    }
    return data
}
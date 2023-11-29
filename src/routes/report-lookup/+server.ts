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
        switch (req.analyticStage) {
            case 0:
                currAnalytics.scannedQrCode = true
                let { data, error } = await supabase
                    .from('campaign_customers')
                    .update({ analytics: currAnalytics })
                    .eq('customer_id', req.uuid)
                if (error)
                    return new Response(JSON.stringify(error))
                return new Response(JSON.stringify(data))
            case 1:
                currAnalytics.consented = true
                let { data, error } = await supabase
                    .from('campaign_customers')
                    .update({ analytics: currAnalytics })
                    .eq('customer_id', req.uuid)
                if (error)
                    return new Response(JSON.stringify(error))
                return new Response(JSON.stringify(data))
            case 2:
                currAnalytics.bookedConsultation = true
                let { data, error } = await supabase
                    .from('campaign_customers')
                    .update({ analytics: currAnalytics })
                    .eq('customer_id', req.uuid)
                if (error)
                    return new Response(JSON.stringify(error))
                return new Response(JSON.stringify(data))
        }
    }
}
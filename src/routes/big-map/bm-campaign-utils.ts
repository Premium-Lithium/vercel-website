// From campaign_master get all campaign IDs and Names for filtering - array of object {id: string, title: string}

export async function getCampaignIdAndNames() {
    await fetch('big-map/supabase/campaign-master', {
        method: 'GET',
        headers: {
            'Content-Type': 'application-json'
        }
    })
}
import { get } from "svelte/store"
import { campaignKey, selectedCampaigns, type CampaignElement, campaignMarkers } from "./bm-cm-stores"
import { map, type LatLongObj } from "./bm-pd-stores"

export async function getCampaignIdAndNames() {
    let res = await fetch('big-map/supabase/campaign-master', {
        method: 'GET',
        headers: {
            'Content-Type': 'application-json'
        }
    })
    let nameId = await res.json()

    campaignKey.set(nameId.body)
}

export async function getAddressesInCampaign(campaign: string): Promise<Array<CampaignElement>> {
    let res = await fetch('big-map/supabase/campaign-addresses', {
        method: "POST",
        headers: {
            'Content-Type': 'application-json'
        },
        body: JSON.stringify(campaign)
    })
    let parsed = await res.json()

    return parsed.body
}

export async function displaySelectedCampaigns() {
    let markerArr: Array<google.maps.Marker> = []
    for (let campaign of get(selectedCampaigns)) {
        let campaignElements = await getAddressesInCampaign(campaign.id)
        for (let element of campaignElements) {
            markerArr.push(await createMarkerForCampaignCustomer(element))
        }
    }
    campaignMarkers.set(markerArr)
}

async function createMarkerForCampaignCustomer(customer: CampaignElement): Promise<google.maps.Marker> {
    let latLng = await getLatLongForCustomer(customer)
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(latLng.lat, latLng.lng),
        title: customer.formattedAddress,
        icon: 'marker-base.svg',
        visible: true
    })
    marker.setMap(get(map))
    return marker
}

async function getLatLongForCustomer(customer: CampaignElement): Promise<LatLongObj> {
    let latLng: LatLongObj = {lat: 0, lng: 0}
    if ('geometry' in customer.address){
        latLng.lat = customer.address.geometry.location.lat
        latLng.lng = customer.address.geometry.location.lng
    } else {
        let postcodeReq = await fetch('https://api.postcodes.io/postcodes/' + customer.address.postcode)
        let parsed = await postcodeReq.json()
        latLng.lat = parsed.latitude
        latLng.lng = parsed.longitude
    }
    return latLng
}
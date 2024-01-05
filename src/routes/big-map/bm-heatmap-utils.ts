import { get } from "svelte/store"
import { map, campaignHeatmap, osHeatmap, campaignKey } from "./bm-stores"
import { getAddressesInCampaign } from "./bm-campaign-utils"

export async function generateOsHeatmap() {
    console.log("Generating OS Heatmap")
    let heatmapData: Array<google.maps.LatLng> = []
    const heatRes = await fetch('./heatmapCoords.csv')
    const data = await heatRes.text()
    const lines = data.split('\n')
    for (let line = 2; line < lines.length; line++) {
        let row = lines[line].split(',')
        if (!isNaN(parseFloat(row[0])) && !isNaN(parseFloat(row[1])))
            heatmapData.push(new google.maps.LatLng(parseFloat(row[0]), parseFloat(row[1])))
    }
    osHeatmap.set(new google.maps.visualization.HeatmapLayer({
        data: heatmapData
    }))
}

export async function generateCampaignHeatmap() {
    console.log("Generating Campaign Heatmap")
    let heatmapData: Array<google.maps.LatLng> = []
    for (let campaign of get(campaignKey)) {
        let customerAddresses = await getAddressesInCampaign(campaign.id)
        for (let customer of customerAddresses) {
            if ("geometry" in customer.address) {
                heatmapData.push(new google.maps.LatLng(customer.address.geometry.location.lat, customer.address.geometry.location.lng))
            }
        }
    }
    campaignHeatmap.set(new google.maps.visualization.HeatmapLayer({
        data: heatmapData
    }))
}

export async function toggleHeatmap() {
    let hm = get(osHeatmap)
    if (hm.getMap() === get(map)) {
        hm.setMap(null)
    } else {
        hm.setMap(get(map))
    }
    osHeatmap.set(hm)
}

export function toggleCampaignHeatmap() {
    let hm = get(campaignHeatmap)
    if (hm.getMap() === get(map)) {
        hm.setMap(null)
    } else {
        hm.setMap(get(map))
    }
    campaignHeatmap.set(hm)
}
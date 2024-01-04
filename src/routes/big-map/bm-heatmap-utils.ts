import { get } from "svelte/store"
import { heatmap, map } from "./bm-stores"

export async function generateHeatmap() {
    let heatmapData: Array<google.maps.LatLng> = []
    const heatRes = await fetch('./heatmapCoords.csv')
    const data = await heatRes.text()
    const lines = data.split('\n')
    for (let line = 2; line < lines.length; line++) {
        let row = lines[line].split(',')
        if (!isNaN(parseFloat(row[0])) && !isNaN(parseFloat(row[1])))
            heatmapData.push(new google.maps.LatLng(parseFloat(row[0]), parseFloat(row[1])))
    }
    heatmap.set(new google.maps.visualization.HeatmapLayer({
        data: heatmapData
    }))
}

export async function toggleHeatmap() {
    let hm = get(heatmap)
    if (hm.getMap() === get(map)) {
        hm.setMap(null)
    } else {
        hm.setMap(get(map))
    }
    heatmap.set(hm)
}
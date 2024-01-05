import { writable, type Writable } from "svelte/store"

export interface CampaignKey {
    name: string
    id: string
}

export interface CampaignElementStatus {
    name: string
    description: string
    dateStarted: number
}

export interface CampaignElement {
    formattedAddress: string
    address: any
    currentStatus: CampaignElementStatus
    customerId: string
}

export let campaignKey: Writable<Array<CampaignKey>> = writable([])
export let selectedCampaigns: Writable<Array<CampaignKey>> = writable([])
export let campaignMarkers: Writable<Array<google.maps.Marker>> = writable([])
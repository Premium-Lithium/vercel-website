import { writable, type Writable, readable, type Readable } from "svelte/store"

export interface MapResponse {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  // Array of map markers, drawings or both
}

export interface MapRequest {
    option: number,
    body: undefined | any,
}

export interface StageFilter {
    id: string
    name: string
}

export interface PipeLineKey {
    name: string,
    id: number
    stages: Array<StageFilter>
}

export interface DealFilter {
    value: number
    status: string
}

export interface MarkerOptions {
    latLng: LatLongObj
    address: string
    visible: boolean
    marker: google.maps.Marker
    content: string | undefined
    filterOption: DealFilter
    pipelineId: string
    stageId: string
    deal: any
    colour: string
    labelID: string
}

export interface LatLongObj {
    lat: number
    lng: number
}

export interface OptionPanel {
    pipeline: PipeLineKey | undefined
    hideStageOptions: boolean
    stages: Array<string>
    stagesVisible: Array<string>
    filters: Array<string>
    filtersApplied: Array<string>
    markers: Array<MarkerOptions>
    colour: string
    handle: HTMLElement
}

export interface LabelInfo {
    name: string
    id: string
    color: string
}

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

// Map/UI
export let map: Writable<any> = writable()
export let mapOptionPanels: Writable<Array<OptionPanel>> = writable([])
export let loading: Writable<boolean> = writable(false)

// Pipedrive
export let pipelines: Writable<Array<PipeLineKey>> = writable([]) // Array of all pipelines and IDs
export let selectedPipelines: Writable<Array<number>> = writable([]) // Array of selected pipelines filtered by
export let value: Writable<number> = writable(0)
export let labels: Writable<Array<LabelInfo>> = writable([])
export let statusFilters: Writable<Array<string>> = writable([])
export let wonDate: Writable<string> = writable()
export let installDate: Writable<string> = writable()
export let quoteDate: Writable<string> = writable()
export let checkWonTime: Writable<boolean> = writable(false)
export let checkInstalledTime: Writable<boolean> = writable(false)
export let checkQuoteTime: Writable<boolean> = writable(false)
export let showNullMarkers: Writable<boolean> = writable(false)
export let hidePipelineOptions: Writable<boolean> = writable(false)
export let hideFilterOptions: Writable<boolean> = writable(false)
export let labelFilter: Writable<Array<string>> = writable([]) // Array of label IDs, not names
export let applyLabelColourToMarker: Writable<boolean> = writable(false)
export let hideLabelOptions: Writable<boolean> = writable(false)

export const colourMap: Readable<Map<string, string>> = readable(new Map([
    ['yellow', '#E1F378'],
    ['brown', '#302411'],
    ['purple', '#222F60'],
    ['orange', '#F9BF3B'],
    ['blue', '#35BBED'],
    ['red', '#F0302E'],
    ['pink', '#F6A19A'],
    ['green', '#C9FC50'],
    ['dark-gray', '#464748']
]));

// Feedback Email
export const enableFeedback: Writable<boolean> = writable(false)
export let feedbackOptions: Writable<Array<string>> = writable([])
export let feedbackMessage: Writable<string> = writable()
export let feedbackSubmitted: Writable<boolean> = writable(false)

// Campaign
export let campaignKey: Writable<Array<CampaignKey>> = writable([])
export let selectedCampaigns: Writable<Array<CampaignKey>> = writable([])
export let campaignMarkers: Writable<Array<google.maps.Marker>> = writable([])

// Heatmap
export let osHeatmap: Writable<google.maps.visualization.HeatmapLayer> = writable()
export let campaignHeatmap : Writable<google.maps.visualization.HeatmapLayer> = writable()

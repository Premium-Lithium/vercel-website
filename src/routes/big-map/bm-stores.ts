import { writable, type Writable } from "svelte/store"

export interface MapResponse {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  // Array of map markers, drawings or both
}
// To be expanded as necessary
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

// Location of marker, address of marker, visibility of marker on map, marker object itself, content of popup when clicked, array of filters that this marker will show up for
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

// Panel displaying options for each selected pipeline (for now, later on adding campaign etc.)
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

export let pipelines: Array<PipeLineKey> = [] // Array of all pipelines and IDs
export let selectedPipelines: Array<number> = [] // Array of selected pipelines filtered by
export let mapOptionPanels: Array<OptionPanel> = []
export let map: any, loader: any
export let handle: HTMLElement
export let helpHandle: HTMLElement
export let loading: boolean = false
export let icon: string
export let value: number = 0
export let labels: Array<LabelInfo> = []
export let statusFilters: Array<string> = []
export let feedbackOptions: Array<string> = []
export let feedbackMessage: string
export let feedbackSubmitted: boolean = false
export let wonDate: Date = new Date(1420977600000)
export let installDate: Date = new Date(1420977600000)
export let quoteDate: Date = new Date(1420977600000)
export let checkWonTime: boolean = false
export let checkInstalledTime: boolean = false
export let checkQuoteTime: boolean = false
export let showNullMarkers: boolean = false
export let heatmap: google.maps.visualization.HeatmapLayer
export let hidePipelineOptions: boolean = false
export let hideFilterOptions: boolean = false
export let labelFilter: Array<string> = [] // Array of label IDs, not names
export let applyLabelColourToMarker: boolean = false
export let hideLabelOptions: boolean = false

const colourMap = new Map([
    ['yellow', '#E1F378'],
    ['brown', '#302411'],
    ['purple', '#222F60'],
    ['orange', '#F9BF3B'],
    ['blue', '#35BBED'],
    ['red', '#F0302E'],
    ['pink', '#F6A19A'],
    ['green', '#C9FC50'],
    ['dark-gray', '#464748']
])
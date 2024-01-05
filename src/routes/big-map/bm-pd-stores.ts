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

export let map: Writable<any> = writable()
export let pipelines: Writable<Array<PipeLineKey>> = writable([]) // Array of all pipelines and IDs
export let selectedPipelines: Writable<Array<number>> = writable([]) // Array of selected pipelines filtered by
export let mapOptionPanels: Writable<Array<OptionPanel>> = writable([])
export let loading: Writable<boolean> = writable(false)
export let value: Writable<number> = writable(0)
export let labels: Writable<Array<LabelInfo>> = writable([])
export let statusFilters: Writable<Array<string>> = writable([])
export let feedbackOptions: Writable<Array<string>> = writable([])
export let feedbackMessage: Writable<string> = writable()
export let feedbackSubmitted: Writable<boolean> = writable(false)
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

export const enableFeedback: Writable<boolean> = writable(false)
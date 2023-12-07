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

// Location of marker, address of marker, visibility of marker on map, marker object itself, content of popup when clicked, array of filters that this marker will show up for
export interface MarkerOptions {
    latLng: LatLongObj
    address: string
    visible: boolean
    marker: google.maps.Marker
    content: string | undefined
    filterOption: Array<string>
    pipelineId: string
    stageId: string
}

export interface LatLongObj {
    lat: number
    lng: number
}

// Panel displaying options for each selected pipeline (for now, later on adding campaign etc.)
export interface OptionPanel {
    pipeline: PipeLineKey | undefined
    stages: Array<string>
    stagesVisible: Array<string>
    filters: Array<string>
    filtersApplied: Array<string>
    markers: Array<MarkerOptions>
    colour: string
    handle: HTMLElement
}
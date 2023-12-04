export interface MapResponse {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  // Array of map markers, drawings or both
}

// To be expanded as necessary
export interface MapRequest {
    option: number, 
}

export interface PipeLineKey {
    name: string,
    id: number
}

// Location of marker, address of marker, visibility of marker on map, marker object itself, content of popup when clicked, array of filters that this marker will show up for
export interface MarkerOptions {
    latLng: LatLongObj
    address: string
    visible: boolean
    marker: any | undefined
    content: string | undefined
    filterOption: Array<string>
}

export interface LatLongObj {
    lat: number
    lng: number
}
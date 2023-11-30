export interface Response {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  
}

export interface Request {
    option: number,
}

export interface Options {
    option: number
}

export interface MarkerOptions {
    latLng: LatLongObj
    address: string
    visible: boolean
    marker: any | undefined
    content: string | undefined
}
export interface LatLongObj {
    lat: number
    lng: number
}
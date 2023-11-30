import type { MapResponse, MapRequest, MarkerOptions, LatLongObj } from "./MapTypes"
import { CRM } from "$lib/crm/crm-utils"

let crm = new CRM()
const bdmPipelineStages = new Map([
    [248, 'Prospect Email'],
    [253, 'Email Sent'],
    [249, 'Link Clicked'],
    [255, 'Unable to Contact'],
    [254, '1st Call Made'],
    [250, 'Expression of Interest'],
    [251, 'Awaiting Confirmation'],
    [262, 'Interested in other regions of UK'],
    [275, 'Confirmed partner - Yorkshire'],
    [252, 'Confirmed partner - M25'],
    [263, 'Partner Paid'],
])

/**
 * Parses body, sends to request handler, returns response from request handler
 * @param request Request object
 * @returns Response after having been handled
 */
export async function POST({ request }) {
    const req = await request.json()
    const res: MapResponse = await requestHandler(req.opts)

    return new Response(JSON.stringify(res))
}

/**
 * Reads the request option and directs it to the correct function with relevant data, returns message from that function
 * @param req Body of the post request
 * @returns Response message
 */
async function requestHandler(opts: MapRequest): Promise<MapResponse> {
    switch (opts.option) {
        case 0:
            return ({ ok: true, message: '', statusCode: 200, body: undefined })
        default:
            let markers = await getAllDealsWithAddress()
            return ({ ok: true, message: 'Default', statusCode: 200, body: markers })
    }
}

/**
 * Gets all deals with addresses - filter id = 384
 * @returns markers
 */
async function getAllDealsWithAddress(): Promise<Array<MarkerOptions>> {
    let markers: Array<MarkerOptions> = []
    let finished = false
    let nextPagination: number = 0
    while (!finished) {
        let deals = await crm.getAllDealsWithFilter('384', nextPagination)
        for (let deal in deals.data) {
            let address = deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address']
            if (address) {
                let res = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
                    { method: 'GET' }
                )
                let locRes = await res.json()
                let marker: MarkerOptions = {
                    latLng: locRes.results[0].geometry.location,
                    address: deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address'],
                    visible: true,
                    marker: undefined,
                    content: deals.data[deal].title,
                    filterOption: []
                }
                markers.push(marker)
            }
        }
        if (deals.additional_data.pagination.more_items_in_collection) {
            nextPagination = deals.additional_data.pagination.next_start
        } else {
            finished = true
        }
    }
    return markers
}

/**
 * 
 * @param pipeline the pipeline to be searched (for now just BDM)
 * @returns Array of markers
 */
async function getAllDealsInPipeline(pipeline: string, filterId?: string): Promise<Array<MarkerOptions>> {
    
}
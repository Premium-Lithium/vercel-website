import type { Response, Request, MarkerOptions, LatLongObj } from "./MapTypes"
import { CRM } from "$lib/crm/crm-utils"

let crm = new CRM()

/**
 * Parses body, sends to request handler, returns response from request handler
 * @param request Request object
 * @returns Response from 
 */
export async function POST({ request }) {
    const req: Request = await request.json()
    const res: Response = await requestHandler(req)

    return new Response(JSON.stringify(res))
}

/**
 * Reads the request option and directs it to the correct function with relevant data, returns message from that function
 * @param req Body of the post request
 * @returns Response message
 */
async function requestHandler(req: Request): Promise<Response> {
    switch (req.opts.option) {
        case 0:
            // Get all deals with an address
            let markers = await getAllDealsWithAddress()
            return ({ ok: true, message: '', statusCode: 200, body: markers })
        default:
            return ({ ok: true, message: 'Default', statusCode: 201 })
    }
}

/**
 * Gets all deals with addresses - filter id = 384
 * @returns 
 */
async function getAllDealsWithAddress(): Promise<Array<MarkerOptions>> {
    let markers: Array<MarkerOptions> = []
    let finished = false
    let nextPagination: number = 0
    while (!finished) {
        let deals = await crm.getAllDealsWithFilter('384', nextPagination)
        for (let deal in deals.data) {
            console.log(deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address'])
            let marker: MarkerOptions = {
                latLng: { lat: deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_lat'], lng: deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_long'] },
                address: deals.data[deal]['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address'],
                visible: true,
                marker: undefined,
                content: ''
            }
            markers.push(marker)
        }
        if (deals.additional_data.pagination.more_items_in_collection) {
            nextPagination = deals.additional_data.pagination.next_start
        } else {
            finished = true
        }
    }

    console.log("Finished Pagination, markers: ", markers.length)
    return markers
}

async function getLatLongForAddress(address: string): Promise<LatLongObj> {
    let latLng: LatLongObj;
    
    return latLng
}
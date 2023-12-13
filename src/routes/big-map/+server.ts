import type { MapResponse, MapRequest, MarkerOptions, LatLongObj, PipeLineKey, StageFilter } from "./MapTypes"
import { CRM } from "$lib/crm/crm-utils"

let crm = new CRM()

/**
 * Parses body, sends to request handler, returns response from request handler
 * @param request Request object
 * @returns Response after having been handled
 */
export async function POST({ request }) {
    const req = await request.json()
    const res: MapResponse = await requestHandler(req)

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
        case 1: // From an array of pipeline ids, get all deals and create markers with filters
            let markers: Array<MarkerOptions> = []
            for (let pipeline in opts.body) {
                let deals = await getAllDealsInPipeline(opts.body[pipeline])
                for (let marker in deals) {
                    markers.push(deals[marker])
                }
            }
            return ({ ok: true, message: 'Got deals for all pipelines', statusCode: 200, body: markers })
        case -1: // Reserved for getting selected pipelines
            let pipelines = await getPipelines()
            return ({ ok: true, message: '', statusCode: 200, body: pipelines })
        case -2: // Reserved for getting filters for the selected pipelines
        default:
            return ({ ok: true, message: 'Default', statusCode: 200, body: undefined })
    }
}

/**
 * Gets all stage names and IDs of a given pipeline for filtering
 * @param pipelineId ID of the pipeline to retrieve stages for
 * @returns array of stages with name and id
 */
async function getStagesForPipeLine(pipelineId: number): Promise<Array<StageFilter>> {
    let stages: Array<StageFilter> = []
    let stageIds = await crm.getStagesFor(pipelineId)
    for (let stage in stageIds) {
        let stageName = await crm.getStageNameFor(stageIds[stage])
        const stageFilter: StageFilter = {
            id: stageIds[stage],
            name: stageName
        }
        stages.push(stageFilter)
    }
    return stages
}

/**
 * Gets all deals with an address in pipedrive
 * @returns array of pipelines with name and ID
 */
async function getPipelines(): Promise<Array<PipeLineKey>> {
    const pipelines = await crm.getAllPipelines()
    let pipelinesKeysArr = []
    for (let pipeline in pipelines.data) {
        // try to get one deal - if not null don't add to pipelinesKeysArr
        let dealsInPipelines = await crm.checkIfPipelineHasValidDeals(pipelines.data[pipeline].id)
        if (dealsInPipelines) {
            let pipelineKey: PipeLineKey = {
                name: pipelines.data[pipeline].name,
                id: pipelines.data[pipeline].id,
                stages: await getStagesForPipeLine(pipelines.data[pipeline].id)
            }
            getStagesForPipeLine(pipelineKey.id)
            pipelinesKeysArr.push(pipelineKey)
        }
    }
    return pipelinesKeysArr
}

/**
 * Searches through a deal to find an address from any field - Deal Address of Property Organization Address
 * @param deal individual deal to search address for
 * @returns address if found, null if not
 */
async function findAddressFrom(deal: any): Promise<string | null> {
    if (deal['6b9665ec09998cda1910dbb2fdc6c2d7d6c49b2e']) {
        return deal['6b9665ec09998cda1910dbb2fdc6c2d7d6c49b2e']
    }
    if (deal['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address']) {
        await crm.setFormattedAddressFor(deal.id, deal['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address'])
        return deal['80ebeccb5c4130caa1da17c6304ab63858b912a1_formatted_address']
    }
    if (deal.org_id) {
        const org = await crm.getOrganizationFor(deal.org_id)
        if (org.data.address_formatted_address) {
            await crm.setFormattedAddressFor(deal.id, org.data.address_formatted_address)
            return org.data.address_formatted_address
        }
    }
    return null
}

/**
 * Checks if the deal has the latitude and longitude, returns it if it does
 * If it doesn't, checks if it has a formatted address, gets lat long from this and returns it if it does
 * If it doesn't, checks if the organisation attached to it has a foramtted address, gets lat long from this and returns it if it does
 * Returns null otherwise
 * @param deal deal to operate on
 * @returns lat long object if address found, null if not
 */
async function getLatLongFor(deal: any): Promise<LatLongObj | null> {
    if (deal['730c28155f2aa8bef8cbc858811bb350a25a14d0'] && deal['0fa7d4a340a160bfe5c5ff7b21e8e3948ec9068b']) {
        let locRes = { lat: deal['730c28155f2aa8bef8cbc858811bb350a25a14d0'], lng: deal['0fa7d4a340a160bfe5c5ff7b21e8e3948ec9068b'] }
        return locRes
    }
    let address = await findAddressFrom(deal)
    if (address) {
        let res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
            { method: 'GET' }
        )
        try {
            let locRes = (await res.json()).results[0].geometry.location
            await crm.setLatLongFor(deal.id, locRes)
            return locRes
        }
        catch {
            return null
        }
    }
    return null
}

/**
 * Updates the content of a marker
 * @param marker marker to operate on
 * @param deal deal to pull data from
 * @returns marker with content
 */
function setContentOfMarker(marker: MarkerOptions, deal: any): MarkerOptions {
    const content = `
    <h1>${deal.title}</h1>
    <p>Address: ${marker.address}</p>
    <p>Status: ${marker.filterOption.status}</p>
    <p>Value: £${marker.filterOption.value}
    `
    marker.content = content
    return marker
}

/**
 * 
 * @param pipeline the pipeline to be searched
 * @returns Array of markers
 */
async function getAllDealsInPipeline(pipeline: string): Promise<Array<MarkerOptions>> {
    let markers: Array<MarkerOptions> = []
    let finished = false
    let nextPagination: number = 0
    while (!finished) {
        let deals = await crm.getAllDealsFromPipelineWithFilter(pipeline, '384', nextPagination)
        for (let deal in deals.data) {
            let address = await findAddressFrom(deals.data[deal])
            let latLng = await getLatLongFor(deals.data[deal])
            if (address && latLng) {
                let marker: MarkerOptions = {
                    latLng: latLng,
                    address: address,
                    visible: true,
                    marker: undefined,
                    content: '',
                    filterOption: { value: (deals.data[deal].value) ? deals.data[deal].value : 0, status: deals.data[deal].status },
                    pipelineId: pipeline,
                    stageId: deals.data[deal].stage_id,
                    deal: deals.data[deal]
                }
                marker = setContentOfMarker(marker, deals.data[deal])
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
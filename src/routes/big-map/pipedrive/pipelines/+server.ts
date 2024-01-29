import type { PipeLineKey } from "../bm-stores"
import { CRM } from "$lib/crm/crm-utils"

let crm = new CRM()

export async function GET() {
    const res = await getPipelines()

    return new Response(JSON.stringify(({ ok: true, message: '', statusCode: 200, body: res })))
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
                stages: await crm.getStagesFor(pipelines.data[pipeline].id, pipelines.data[pipeline].name)
            }
            pipelinesKeysArr.push(pipelineKey)
        }
    }
    return pipelinesKeysArr
}

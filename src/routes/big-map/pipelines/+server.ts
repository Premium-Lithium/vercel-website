import type { PipeLineKey, StageFilter } from "../MapTypes"
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
                stages: await getStagesForPipeLine(pipelines.data[pipeline].id)
            }
            getStagesForPipeLine(pipelineKey.id)
            pipelinesKeysArr.push(pipelineKey)
        }
    }
    return pipelinesKeysArr
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
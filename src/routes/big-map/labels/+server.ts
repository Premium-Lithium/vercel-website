import type { LabelInfo } from "../bm-stores"
import { CRM } from "$lib/crm/crm-utils"

let crm = new CRM()
let labelInfo: Array<LabelInfo> = []

export async function GET() {
    const res = await getLabels()

    return new Response(JSON.stringify(({ ok: true, message: '', statusCode: 200, body: res })))
}

async function getLabels(): Promise<Array<LabelInfo>> {
    let labels: Array<LabelInfo> = []
    let labelFieldID = "12463"

    let dealFields = await crm.getDealFieldOptionsFor(labelFieldID)
    for (let option in dealFields.options) {
        let label: LabelInfo = {
            name: dealFields.options[option].label,
            id: dealFields.options[option].id.toString(),
            color: dealFields.options[option].color
        }
        labels.push(label)
    }
    labelInfo = labels
    return labels
}
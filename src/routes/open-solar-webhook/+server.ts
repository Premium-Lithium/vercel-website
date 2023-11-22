/*
"trigger_fields": [
    "event.update",
    "project.systems.output_annual_kwh"
],
    "payload_fields": [
        "project.address",
        "project.systems"
    ],
*/

import fs from 'fs';
import { openSolarAPI } from '$lib/crm/opensolar-utils.js';
const openSolar = new openSolarAPI()

// WEB HOOK TRIGGERS: "project.systems.output_annual_kwh"
// PAYLOAD: "project.address", "project.systems"
export async function POST({ request }) {
    // Receives Projects.ID that are updateed based on output_annual_kwh (a change in design)
    const response = await request.json()

    //Only interested in UPDATES
    if (response.event == 'UPDATE') {
        console.log("Updated Project:", response)
        const projectData = {
            id: response.model_id,
            fields: response.fields
        }
        if ((projectData.fields.systems).size != 0) { //Only download if a system exists
            await downloadSystemImageFrom(projectData)
        } else {
            console.log("Design not created, unable to get system image")
        }
    }
    return new Response(JSON.stringify(response))
}

async function downloadSystemImageFrom(projectData) {
    const projectId = projectData.id
    const uuid = projectData.fields.systems[0].uuid

    const buff = await openSolar.getBufferImageFrom(projectId, uuid, [500, 500])

    const addressName = (projectData.fields.address).split(' ').join('_')
    const filePath = `${addressName}_Layout.jpeg`
    fs.writeFileSync(filePath, buff)
    console.log("Image fetched")
}

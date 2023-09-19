// API endpoint for setting backup duration

import { json } from "@sveltejs/kit";

// will POST to prediction algorithm to modify instructions

export async function POST ({request, url}) {
    const datastore = "http://" + url.host + "/energy-arbitrage/data/store";
    const backupDuration = await request.json();
    const resultMsg = await setBackupDuration(backupDuration, datastore);


    return json(resultMsg);

}

// TODO: will update prediction
async function setBackupDuration(duration: number, datastore: string) {
    // update datastore API endpoint
    let updateBody: API.StoreAction = {
        action: "UPDATE",
        field: "pref.backup",
        val: duration
    }
    await fetch(datastore, {
        method: "POST",
        body: JSON.stringify(updateBody),
        headers: {
            "content-type": "application-json"
        }
    });
    
    return "duration set to " + duration + " hours";
}
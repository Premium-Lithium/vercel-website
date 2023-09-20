// calculate stored power duration based on usage predictions

import { json } from "@sveltejs/kit";

// user preferences are stored in long term storage


export async function POST ({url, request}) {
    const datastore = "http://" + url.host + "/energy-arbitrage/data/store";
    const requestdata = await request.json();

    const userID = requestdata.user;  // placeholder

    // make request to user preferences in datastore
    const requestDurationBody: API.StoreAction = {
        action: "READ",
        field: "pref.backup",
        val: 0
    }
    const storeRequest = await fetch(datastore, {
        method: "POST",
        body: JSON.stringify(requestDurationBody),
        headers: {
            "content-type": "application-json"
        }
    });

    const backupNeeded = await storeRequest.json();


    //TODO: insert actual calculation
    // assume use of 0.8 kWh per hour
    let nrgPerHour = 0.8;
    const nrgNeeded = backupNeeded * nrgPerHour;
    console.log([nrgNeeded, backupNeeded]);
    return json([nrgNeeded, backupNeeded]);
}
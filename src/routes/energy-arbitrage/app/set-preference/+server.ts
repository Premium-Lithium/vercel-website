// set optimization preference

import { json } from "@sveltejs/kit";

// will communicate with arbitrage calculation

export async function POST ({request, url}) {
    const optPref = await request.json();
    const datastore = "http://" + url.host + "/energy-arbitrage/data/store";

    const resultMsg = await setPref(optPref, datastore);


    return json(resultMsg);
}


async function setPref(preference:string, datastore: string) {
    // update datastore API endpoint
    console.log(preference)
    let updateBody: API.StoreAction = {
        action: "UPDATE",
        field: "pref.opt",
        val: preference
    }
    await fetch(datastore, {
        method: "POST",
        body: JSON.stringify(updateBody),
        headers: {
            "content-type": "application-json"
        }
    });
    
    let retStr = "Preference set to " + preference + ".";

    return retStr;
}
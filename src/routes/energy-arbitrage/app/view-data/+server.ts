// retrieve and view data
// get usage and generation data from relevent APIs
// and process them into viewable form

import { ActionFailure, json } from "@sveltejs/kit";

// makes a request to the data store of past info
// specifies timeframe to get data from
// receives data for that many steps


// retrieve data from data/store
// format in some way or another
// send it on
// app will request some data
// this is an "authenticated" bridge between the app and the database
// DMZ to prevent direct database access
// gotta protect those keys

export async function POST ({url, request}) {
    // request form:
    // {user ID, number of steps}

    const requestParams = await request.json();
    const userID = requestParams.user;
    
    const steps = requestParams.steps;

    // make a call to the storage API for all data fields
    const storageAPILoc = "http://" + url.host + "/energy-arbitrage/data/store";

    // make calls to storage API

    const usageRequest = {
        "field": "usage",
        "action": "READ",
        "steps": steps
    }
    const generationRequest = {
        "field": "generation",
        "action": "READ",
        "steps": steps
    }

    const usageResponse = await fetch(storageAPILoc, {
        method: "POST",
        body: JSON.stringify(usageRequest),
        headers: {
            "content-type": "application-json"
        }
    });
    let usageData = await usageResponse.json();

    const generationResponse = await fetch(storageAPILoc, {
        method: "POST",
        body: JSON.stringify(generationRequest),
        headers: {
            "content-type": "application-json"
        }
    });
    let generationData = await generationResponse.json();

    return json([usageData, generationData]);
}
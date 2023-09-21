// calculate stored power duration based on usage predictions
/**
 * V2:
 *  send timestep and future time to store energy for
 *  Sum amount of energy used over that period (kWh needed)
 *  return amount of energy needed
 */

import { json } from "@sveltejs/kit";

const usageArr = [0.098541809, 0.024635453, 0.113323081, 0.024635453, 0.118250171, 0.049270904, 0.118250171, 0.024635453, 0.093614718, 0.049270904, 0.044343814, 0.098541809, 0.024635453, 0.118250171, 0.024635453, 0.118250171, 0.083760537, 0.980491, 1.044543176, 0.758771931, 0.270989975, 0.152739804, 0.137958532, 0.97556391, 0.202010709, 0.226646161, 0.142885623, 0.980491, 8.326783362, 3.212462977, 0.241427432, 0.285771247, 0.266062885, 0.714428116, 0.251281613, 0.285771247, 0.640521759, 0.295625427, 0.261135794, 0.285771247, 0.32518797, 0.226646161, 0.344896331, 0.093614718, 0.10839599, 0.024635453, 0.113323081, 0.024635453]
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
    console.log(backupNeeded)


    //TODO: insert actual calculation
    // assume use of 0.8 kWh per hour
    let nrgPerHour = 0.8;
    const nrgNeeded = backupNeeded * nrgPerHour;
    console.log([nrgNeeded, backupNeeded]);
    return json([nrgNeeded, backupNeeded]);
}
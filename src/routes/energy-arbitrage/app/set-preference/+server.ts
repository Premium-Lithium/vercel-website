// set optimization preference

import { json } from "@sveltejs/kit";

// will communicate with arbitrage calculation

export async function POST ({request, url}) {
    const optPref = await request.json();
    console.log(optPref);
    const returnString = await setPref(optPref);
    console.log(returnString);
    return json(returnString);
}


async function setPref(preference:string) {
    let retStr = "Preference set to " + preference + ".";

    return retStr;
}
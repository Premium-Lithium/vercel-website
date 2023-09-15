// receive instruction, respond "<instruction> done!"

import { json } from '@sveltejs/kit';

export async function POST ({request}) {
    // request structure:
    // [instruction, chargeTarget]
    // instructions: ["charge from grid", "discharge to grid", "all charge from panels", "regular (charge from excess from panels)"]
    
    const params: [String, Number | null] = await request.json();
    const instruction = params[0];
    const chargeTarget = params[1];
    console.log(instruction);
    console.log(chargeTarget);

    // get current battery level
    let responseString: Array<String> = [];
    let batteryLevel: Number;
    let response = await fetch("/energy-arbitrage/inverter/battery-level");
    console.log("getting battery level");
    batteryLevel = await response.json()

                        // echo a response
    if (chargeTarget === null) {
        responseString.push("No target battery level set");
    } else if (chargeTarget <= batteryLevel ) {
        responseString.push("Battery discharging");
    } else {
        responseString.push("Battery charging")
    }

    responseString.push("'" + instruction + "': completed");

                        const finalString = responseString.join(",\n");
                        return json(finalString);

    
}
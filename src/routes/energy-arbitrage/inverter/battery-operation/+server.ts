// receive instruction, respond "<instruction> done!"

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
    let responseString: String = "";
    let batteryLevel: Number;
    let response = fetch("/energy-arbitrage/inverter/battery-level")
    response.then((responseBody) => {
                responseBody.json().then(
                    (respVal) => {
                        batteryLevel = respVal;

                        // echo a response
                        if (chargeTarget === null) {
                            responseString += "No target battery level set";
                        } else if (chargeTarget < batteryLevel ) {

                        }
                    });
        });

    
}
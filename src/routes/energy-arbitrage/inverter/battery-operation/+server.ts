// receive instruction, respond "<instruction> done!"

export function POST ({request}) {
    // request structure:
    // [instruction, chargeTarget]
    // instructions: ["charge from grid", "discharge to grid", "all charge from panels", "regular (charge from excess from panels)"]
    
    const params: [String, Number | null] = await request.json();
    const instruction = params[0];
    const chargeTarget = params[1];
    console.log(instruction);
    console.log(chargeTarget);
}
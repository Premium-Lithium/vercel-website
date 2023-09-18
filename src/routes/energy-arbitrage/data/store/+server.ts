// API endpoint for data storage

import { error, json } from "@sveltejs/kit";

// parameters:
/*
    data type: [usage, generation, price, etc],
    duration: <number of timesteps>
*/


// dummy data

let energyUsePast = [  // kWh per timestep
    1.45, 2.58, 5.24, 2.18, 2.81, 1.51, 1.35, 2.66, 0.71, 1.04, 1.56, 1.29, 2.31, 3.47, 1.54, 0.76, 2.41, 0.56, 1.66, 0.61, 3.08, 1.29, 3.06, 3.38, 3, 3.51, 0.51, 2.12, 2.13, 2.76, 0.57, 1.09, 2.01, 2.89, 3.02, 2.97, 3.72, 3.27, 2.43, 1.25, 0.56, 1.49, 3.31, 1.09, 3.27, 1.19, 3.76, 1.23, 2.3, 1.6, 2.08, 2.45, 1.75, 2.05, 2.81
]

let energyGenPast = [
    3.11, 2.56, 3.94, 3.9, 2.61, 2.28, 3.5, 0.63, 1.39, 3.12, 2.65, 1.85, 1.03, 3.21, 2.78, 2.48, 0.56, 3.16, 1.52, 3.56, 2.22, 1.48, 1.08, 3.55, 3.43, 3.41, 0.74, 1.9, 1.77, 3.63, 2.84, 3.92, 3.09, 3.96, 2.97, 1.82, 2.24, 2.98, 0.98, 3.33, 2.8, 2.82, 0.65, 3.03, 2.09, 0.95, 2.66, 3.33, 2.22, 2.2, 2.74, 2.46, 3.03, 1.86, 0.63
]

export async function POST ({url, request}) {
    const requestParams = await request.json();
    try {
        // for data retrieval
        console.log("1");
        if (requestParams.action === "READ") {
            const dataRequest = requestParams.field;
            let steps = requestParams.steps

            let dataSelected;
            // error if not a selectable field
            switch(dataRequest) {
                case "usage":
                    dataSelected = energyUsePast;
                    break;
                case "generation":
                    dataSelected = energyGenPast;
                    break;
                default:
                    throw new Error("Invalid input");
            }

            // get last n entries
            steps = Math.min(steps, dataSelected.length)
            const start = (dataSelected.length - steps);
            const returnValues = dataSelected.slice(start);
            return json(returnValues);

        } else if (requestParams.action === "CREATE") {
            // add new value
            const dataField = requestParams.field;
            const dataVal = requestParams.val;
            addEntry(dataField, dataVal);
            return json(0);
        }
    } catch {
         throw error(400, {
            message: "Error 400: Bad Request"
         });
    
    }
}

function addEntry(field: string, value: number) {
    switch(field) {
        case "usage":
            energyUsePast.push(value);
            break;
        case "generation":
            energyGenPast.push(value);
            break;
        default:
            throw new Error("Invalid input");
    }

}
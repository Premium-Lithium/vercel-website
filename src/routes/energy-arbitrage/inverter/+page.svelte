<script lang="ts">
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let batteryLevel: String | null= null;
    async function getBatteryLevel() {
        // non blocking API call to battery level
        const resp = fetch("/energy-arbitrage/inverter/battery-level");
        resp.then((responseBody) => {
                responseBody.json().then(
                    (respVal) => {
                        batteryLevel = respVal;
                    });
        });
    }

    let instruction: String = "Test instruction";
    let batteryTarget: number = 50;
    let instructionResponse:String | null = null;
    async function sendBatteryInstruction() {
        // construct package
        const reqBody = JSON.stringify([instruction, batteryTarget]);
        // send request
        const resp = fetch("/energy-arbitrage/inverter/battery-operation", {
            method: "POST",
            body: reqBody,
            headers: {
                "content-type": "application/json"
            }
        });
        resp.then((responseBody) => {
                responseBody.json().then(
                    (respVal) => {
                        instructionResponse = respVal;
                        console.log(respVal);
                    });
        });
    }

    let generatedEnergy: null | number = null;  // energy generated last timestep
    let timeStep:null|number = null;  // timestep duration in hours

    async function getEnergyGeneration() {
        const resp = fetch("/energy-arbitrage/inverter/energy-generation");
        resp.then((respBody) => {
            respBody.json().then((respVal) => {
                generatedEnergy = respVal[0];
                timeStep = respVal[1];
            });
        });
    }

</script>

<body>
    <h1>
        Inverter
    </h1>
    <p>
        Not a visible page on the final product, but sample values can be put here
    </p>
    <br>
    <br>
    <table>
        <tr>
            <td>
                Get battery level
            </td><td>
                <button on:click={getBatteryLevel}>Get Battery Level</button>
            </td><td> 
                <p>{batteryLevel === null ? "No battery data" : batteryLevel}</p>
            </td>
            </tr>
            <tr>
            <td>
                Send instruction to battery
            </td><td>
                <label>Instruction:<input type="text" bind:value={instruction}></label><br>
            </td><td>
                <label>Target battery level<input type=range min=0 max=100 bind:value={batteryTarget}>{batteryTarget}</label>
            </td><td>
                <br><button on:click={sendBatteryInstruction}>Send instruction</button>
            </td><td>
                <p>Response: {instructionResponse === null ? "None" : instructionResponse}</p>
            </td>
        </tr>
        <tr>
            <td>
                Get energy generation
            </td><td>
                <button on:click={getEnergyGeneration}>Get energy generated</button>
            </td><td>
                <p>Generated {generatedEnergy === null ? "unknown " : generatedEnergy}kWh over {timeStep === null ? "?" : timeStep} hours<br>
                Averaging {generatedEnergy && timeStep ? (generatedEnergy / timeStep) : "?"}kW</p>
            </td>
        </tr>
    </table>
</body>

<style>
    table {
        border-spacing: 50px;
        width: 100%;
    }
</style>
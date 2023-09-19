<script lang="ts">
    

    let backupDuration = 8; // backup duration in hours
    let backupResponseString:null|string = null;

    function setBackupDuration () {
        // POST to API
        const requestBody = JSON.stringify(backupDuration);
        const response = fetch("/energy-arbitrage/app/set-backup-duration", {
            method: "POST",
            body: requestBody,
            headers: {
                "content-type": "application/json"
            }
        });
        // parse response
        response.then((responseBody) => {
                responseBody.json().then(
                    (respVal) => {
                        backupResponseString = respVal;
                    });
        });
    }

    let currentOptimization: string;
    let optimizationResponse: string|null = null;
    function setOptimization() {
        // POST to API
        const requestBody = JSON.stringify(currentOptimization);
        const response = fetch("/energy-arbitrage/app/set-preference", {
            method: "POST",
            body: requestBody,
            headers: {
                "content-type": "application/json"
            }
        });
        // parse response
        response.then((responseBody) => {
                responseBody.json().then(
                    (respVal) => {
                        optimizationResponse = respVal;
                    });
        });
    }

    let timestepNum = 10;
    let pastUsageValues: null|Array<number> = null;
    let pastGenValues: null|Array<number> = null;
    

    function getPastData() {
        // get energy usage and generation over past n timesteps
        // make API call for energy data
        const energyBody = {
            user: "placeholder",
            steps: timestepNum / 0.5
        };
        const response = fetch("/energy-arbitrage/app/view-data", {
            method: "POST",
            body: JSON.stringify(energyBody),
            headers: {
                "content-type": "application/json"
            }
        });
        response.then((responseBody) => {
            responseBody.json().then(
                (respVal) => {
                    
                    pastUsageValues = respVal[0];
                    pastGenValues = respVal[1];
                }
            )
        });
        

    }

</script>

<body>
    <h1>
        Customer dashboard app
    </h1>
    <p>
        Will show all their current and past generation plus anything else they could want to see
        Will also have a way for them to select their desired optimisation
        Graph component will be needed for re-use at multiple stages

        Will make API calls to the relevent endpoints to get current data
        Will make API requests to endpoints to send instructions
    </p>

    <table>
        <tr>
            <th>
                Set backup duration (hours)
            </th>
            <td>
                <label>Backup duration<input bind:value={backupDuration} type="range" min=1 max=48> {backupDuration} hours</label>
            </td><td>
                <button on:click={setBackupDuration}>Set duration!</button>
            </td><td>
                <p>{backupResponseString === null ? "no response" : backupResponseString}</p>
            </td>
        </tr>
        <tr>
            <th>
                Choose opimization preference
            </th>
            <td>
                <label>Optimization 
                    <select name="selectOpt" bind:value={currentOptimization}>
                        <option value="save">Save money</option>
                        <option value="life">Battery life</option>
                        <option value="sell">Sell to grid</option>
                        <option value="loss">Reduce :̶.̶|̶:̶;̶</option>
                    </select>
                </label>
            </td><td>
                <button on:click={setOptimization}>Change setting</button>
            </td>
            <td>
                <p>
                {optimizationResponse === null ? "no setting" : optimizationResponse}<br>
                {optimizationResponse === "Preference set to loss." ? "Is this?" : ""}
            </p>
            </td>
        </tr>
        <tr>
            <th>
                Get past data
            </th>
            <td>
                <label>Number of hours <input type="number" min=0.5 step=0.5 bind:value={timestepNum}></label>
            </td>
            <td>
                <button on:click={getPastData}>Get past data</button>
            </td>
            <td class="dataBox">
                {#if !(pastUsageValues === null)}
                <p>Usage over the last {timestepNum} hours: {pastUsageValues.join(", ")}</p>
                {/if}
                {#if !(pastGenValues === null)}
                <p>Generation over the last {timestepNum} hours: {pastGenValues.join(", ")}</p>
                {/if}
            </td>
        </tr>
    </table>
</body>

<style>
    .dataBox {
        width: 25%;
    }
    table {
        border-spacing: 50px;
        width: 100%;
    }
</style>
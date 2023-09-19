<script lang="ts">

    let responseString: string;
    let selectedOption: string;
    let timesteps: number = 1;
    async function apiCall() {
        let a = 2;
        let b = 3;
        const response = await fetch("/energy-arbitrage/data/store", {
            method: "POST",
            body: JSON.stringify({
                "action": "READ",
                "field": selectedOption,
                "val": timesteps
            }),
            headers: {
                "content-type": "application/json"
            }
        });
        let result: Array<number> = await response.json();
        if (response.ok == false) {
            if (response.status == 400) {
                responseString = "Error 400: invalid input. Please try again"
            }
        }
        result.reverse();
        responseString = result.join(", ");
        console.log(result);
    }

    let valToAdd:number = 1.35;
    async function apiAdd() {
        const response = await fetch("/energy-arbitrage/data/store", {
            method: "POST",
            body: JSON.stringify({
                "action": "CREATE",
                "field": selectedOption,
                "val": valToAdd
            }),
            headers: {
                "content-type": "application-json"
            }
        })
    }

    async function logSettings() {

        console.log("logging");
        // get from store
        const requestData: API.StoreAction = {
            action: "READ",
            field: "pref",
            val: 0
        }
        const response = await fetch("/energy-arbitrage/data/store", {
            method: "POST",
            body: JSON.stringify(requestData),
            headers: {
                "content-type": "application-json"
            }
        });
        let result = await response.json();
        console.log(result);
    }

</script>

<body>
    <h1>
        Data
    </h1>
    <p>
        This is an abstraction of a data storage solution.
        Regardless of how and where data is stored, it will be accessed by remote API calls
        Most likely it will be stored in a privilidged database.
        Specific data will be requested and returned
        The request parameters will request a category of data and a number of timesteps
    </p>

    <p>Make an api call</p>
    <label>data field
    <select bind:value={selectedOption}>
        <option value="usage">Energy usage</option>
        <option value="generation">Energy Generation</option>
        <option value="fail!">Fail!</option>
    </select>
    </label>
    <label>distance back
        <input bind:value={timesteps} type="number" min=0>
    </label>
    <button on:click={apiCall}>GO</button>
    <p>Response<br>
        {responseString}
    </p>
    <p>
        Add value via PUT
    </p>
    <input bind:value={valToAdd} type="number" step="0.01" min=0 max=10>
    <button on:click={apiAdd}>Add!</button>
    <br><br><br>
    <p>Log current settings to console</p>
    <button on:click={logSettings}>Log settings!</button>
</body>

<style>

</style>
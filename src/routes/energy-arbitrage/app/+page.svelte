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
    </table>
</body>

<style>
    table {
        border-spacing: 50px;
        width: 100%;
    }
</style>
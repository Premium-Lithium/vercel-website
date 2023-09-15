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

    async function sendBatteryInstruction() {
        
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
                Get battery level<br>
                <button on:click={getBatteryLevel}>Get Battery Level</button>
                <p>{batteryLevel === null ? "No battery data" : batteryLevel}</p>
            </td>
        </tr>
    </table>
</body>

<style>
    
</style>
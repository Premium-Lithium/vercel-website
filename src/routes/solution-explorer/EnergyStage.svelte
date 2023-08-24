<script>
    export let battery
    export let solar
    export let ev
    export let epsups

    function notSure() {
        battery = false
        solar = false
        ev = false
        epsups = false
    }
</script>

<table>
    <tr>
        <td>
            <label for="battery" >Battery</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={battery}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="solar">Solar</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={solar}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="ev">Electric Vehicle Charger</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={ev}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="epsups">EPS / UPS</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={epsups}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="notsure">Not sure</label>
        </td>
        <td>
            <input type="checkbox" on:change={notSure} checked={!(battery || solar || ev || epsups)}>
        </td>
    </tr>
</table>

<style>
    table td:nth-child(1) { text-align: end; }
</style>

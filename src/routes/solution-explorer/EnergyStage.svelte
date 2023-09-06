<script>
    import Carousel from "$lib/components/Carousel.svelte";

    export let queryParams;
    let carousel;


    function notSure() {
        queryParams.battery = false;
        queryParams.solar = false;
        queryParams.ev = false;
        queryParams.epsups = false;
    }

    function nonExact() {
        queryParams.isEnergyUsageExact = false;
    }
    function exact() {
        queryParams.isEnergyUsageExact = true;
    }

    // energy use stats from 'https://www.britishgas.co.uk/energy/guides/average-bill.html'
    const lowEnergyEstimate = 1800
    const mediumEnergyEstimate = 2900
    const highEnergyEstimate = 4300


</script>
<div class="container">
    <h2>What are you looking for?</h2>
    <table>
        <tr>
            <td>
                <label for="battery" >Battery</label>
            </td>
            <td>
                <input type="checkbox" id="battery" bind:checked={queryParams.battery}>
            </td>
        </tr>
        <tr>
            <td>
                <label for="solar">Solar</label>
            </td>
            <td>
                <input type="checkbox" id="solar" bind:checked={queryParams.solar}>
            </td>
        </tr>
        <tr>
            <td>
                <label for="ev">Electric Vehicle Charger</label>
            </td>
            <td>
                <input type="checkbox" id="ev" bind:checked={queryParams.ev}>
            </td>
        </tr>
        <tr>
            <td>
                <label for="epsups">EPS / UPS</label>
            </td>
            <td>
                <input type="checkbox" id="epsups" bind:checked={queryParams.epsups}>
            </td>
        </tr>
        <tr>
            <td>
                <label for="notsure">Not sure</label>
            </td>
            <td>
                <input type="checkbox" id="notsure" on:change={notSure} checked={!(queryParams.battery || queryParams.solar || queryParams.ev || queryParams.epsups)}>
            </td>
        </tr>
    </table>
</div>
<div>
<h2>2. How much energy do you use?</h2>

<div>
    <input
        type="range"
        min=0
        max=10000
        bind:value={queryParams.energyUsage}
        on:change={exact}
    />
{queryParams.energyUsage}kWh / year
</div>

<label for="low">Low</label>
<input
    id="low"
    type="radio"
    name="energy"
    value={lowEnergyEstimate}
    bind:group={queryParams.energyUsage}
    on:change={nonExact}
>
<label for="medium">Medium</label>
<input
    id="medium"
    type="radio"
    name="energy"
    value={mediumEnergyEstimate}
    bind:group={queryParams.energyUsage}
    on:change={nonExact}
>
<label for="high">High</label>
<input
    id="high"
    type="radio"
    name="energy"
    value={highEnergyEstimate}
    bind:group={queryParams.energyUsage}
    on:change={nonExact}
>

<!-- TODO: add not sure -->
</div>
<div>
<h2>3. What are your energy usage habits?</h2>

<table>
    <tr>
        <td>
            <label for="winter" >Do you use more energy in winter?</label>
        </td>
        <td>
            <input type="checkbox" id="winter" bind:checked={queryParams.moreWinterUsage}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="workfromhome" >Does anyone in your household work from home?</label>
        </td>
        <td>
            <input type="checkbox" id="winter" bind:checked={queryParams.workFromHome}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="gasusage" >Do you use oil and gas?</label>
        </td>
        <td>
            <input type="checkbox" id="gasusage" bind:checked={queryParams.oilAndGas}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="highconsumptiondevices" >Do you have any high consumption devices (eg EV Charger, Immersion Heater)?</label>
        </td>
        <td>
            <input type="checkbox" id="highconsumptiondevices" bind:checked={queryParams.highConsumptionDevices}>
        </td>
    </tr>
</table>
</div>
<style>
    .container {
        padding: 1rem;
    }
    table td:nth-child(1) { text-align: end; }
</style>

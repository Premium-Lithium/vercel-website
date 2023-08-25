<script>
    // Question 1
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

    // Question 2
    export let energyUsage
    export let isEnergyUsageExact

    function nonExact() {
        isEnergyUsageExact = false
    }
    function exact() {
        isEnergyUsageExact = true
    }

    // energy use stats from 'https://www.britishgas.co.uk/energy/guides/average-bill.html'
    const lowEnergyEstimate = 1800
    const mediumEnergyEstimate = 2900
    const highEnergyEstimate = 4300

    // Question 3
    export let moreWinterUsage
    export let workFromHome
    export let oilAndGas
    export let highConsumptionDevices

</script>

<h2>1. What are you looking for?</h2>
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

<h2>2. How much energy do you use?</h2>

<div>
    <input
        type="range"
        min=0
        max=10000
        bind:value={energyUsage}
        on:change={exact}
    />
{energyUsage}kWh / year
</div>


<label for="low">Low</label>
<input
    type="radio"
    name="energy"
    value={lowEnergyEstimate}
    bind:group={energyUsage}
    on:change={nonExact}
>
<label for="medium">Medium</label>
<input
    type="radio"
    name="energy"
    value={mediumEnergyEstimate}
    bind:group={energyUsage}
    on:change={nonExact}
>
<label for="high">High</label>
<input
    type="radio"
    name="energy"
    value={highEnergyEstimate}
    bind:group={energyUsage}
    on:change={nonExact}
>

<!-- TODO: add not sure -->

<h2>3. What are you energy usage habits?</h2>

<table>
    <tr>
        <td>
            <label for="winter" >Do you use more energy in winter?</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={moreWinterUsage}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="workfromhome" >Does anyone in your household work from home?</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={workFromHome}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="gasusage" >Do you use oil and gas?</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={oilAndGas}>
        </td>
    </tr>
    <tr>
        <td>
            <label for="gasusage" >Do you have any high consumption devices (eg EV Charger, Immersion Heater)?</label>
        </td>
        <td>
            <input type="checkbox" bind:checked={highConsumptionDevices}>
        </td>
    </tr>
</table>

<style>
    table td:nth-child(1) { text-align: end; }
</style>

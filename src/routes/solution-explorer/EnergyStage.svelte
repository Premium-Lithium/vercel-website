<script lang="ts">
    import Carousel from "$lib/components/Carousel.svelte";
    import BatteryChargingOutline from "svelte-material-icons/BatteryChargingOutline.svelte";
    import SolarPowerVariantOutline from "svelte-material-icons/SolarPowerVariantOutline.svelte";
    import EvStation from "svelte-material-icons/EvStation.svelte";
    import HomeLightningBolt from "svelte-material-icons/HomeLightningBolt.svelte";
    import AccountQuestion from "svelte-material-icons/AccountQuestion.svelte";
	import Accordian from "../../lib/components/Accordian.svelte";

    import BatteryCharging10 from "svelte-material-icons/BatteryCharging10.svelte";
    import BatteryCharging50 from "svelte-material-icons/BatteryCharging50.svelte";
    import BatteryCharging90 from "svelte-material-icons/BatteryCharging90.svelte";
    import BatteryUnknown from "svelte-material-icons/BatteryUnknown.svelte";

    import { onMount } from "svelte";


    export let queryParams;

    let iconHeight;

    function selectedNotSure() {
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
// queryParams.epsups ? "var(--plblue)": "black"
    const iconSelectedColor = "white";
    const iconReleaseColor = "var(--plblue)";

    onMount(() => {
        if (!queryParams.energyUsage) {
            queryParams.energyUsage = mediumEnergyEstimate;
        }
    });
    


</script>
<div class="inner-div">
    <h2>I'm looking for ...</h2>
    <table class="choice-options">
        <tr>
            <td>
                <label>Battery<br>
                    <input class="check-icon" type="checkbox" name="Battery" bind:checked={queryParams.battery}>
                    <div bind:clientHeight={iconHeight} class={queryParams.battery ? "checked-div" : "check-div"}>
                        <BatteryChargingOutline size="100%" color={queryParams.battery ? iconSelectedColor : iconReleaseColor}/>
                    </div>
                </label>
            </td>
            <td>
                <label>Solar<br>
                    <input class="check-icon" type="checkbox" name="Solar" bind:checked={queryParams.solar}>
                    <div class={queryParams.solar ? "checked-div" : "check-div"}>
                        <SolarPowerVariantOutline size="100%" color={queryParams.solar ? iconSelectedColor : iconReleaseColor}/>
                    </div>
                </label>
            </td>
        </tr>
        <tr>
            <td>
                <label>
                EV charger<br>
                <input class="check-icon" type="checkbox" name="EV charger" bind:checked={queryParams.ev}>
                    <div class={queryParams.ev ? "checked-div" : "check-div"}>
                        <EvStation size="100%" color={queryParams.ev ? iconSelectedColor : iconReleaseColor}/>
                    </div>
                </label>
            </td>
            <td>
                <label>
                UPS<br>
                <input class="check-icon" type="checkbox" name="UPS" bind:checked={queryParams.epsups}>
                <div class="{queryParams.epsups ? "checked-div" : "check-div"}">
                    <HomeLightningBolt size="100%" color={queryParams.epsups ? iconSelectedColor : iconReleaseColor}/>
                </div>
                </label>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <label>
                    I'm not sure<br>
                    <input class="check-icon" on:click={selectedNotSure}>
                    <div class="unsure-div" style="height: {iconHeight}px">
                        <AccountQuestion size="100%"/>
                    </div>
                    </label>
            </td>
        </tr>
    </table>
</div>
<div class="inner-div">
    <h2>My energy use ...</h2>

    <div>

        <input
            type="number"
            min=0
            bind:value={queryParams.energyUsage}
            on:change={exact}
            class="energy-use-input"

        />
        <br>
    {queryParams.energyUsage}kWh / year
    </div>
    <br>
    <table class="choice-options">
        <tr>
            <td>
    <label>
    <input
        class="check-icon"
        id="low"
        type="radio"
        name="energy"
        value={lowEnergyEstimate}
        bind:group={queryParams.energyUsage}
        on:change={nonExact}
    ><div class="{queryParams.energyUsage == lowEnergyEstimate ? "radio-selected-div" : "radio-div"}">
        <BatteryCharging10 size="100%"/>
    </div>
    </label><br>Low
</td><td>
    <label>
    <input
        class="check-icon"
        id="medium"
        type="radio"
        name="energy"
        value={mediumEnergyEstimate}
        bind:group={queryParams.energyUsage}
        on:change={nonExact}
    ><div class="{queryParams.energyUsage == mediumEnergyEstimate ? "radio-selected-div" : "radio-div"}">
        <BatteryCharging50 size="100%"/>
    </div>
</label><br>Medium
</td><td>
    <label>
    <input
        class="check-icon"
        id="high"
        type="radio"
        name="energy"
        value={highEnergyEstimate}
        bind:group={queryParams.energyUsage}
        on:change={nonExact}
    ><div class="{queryParams.energyUsage == highEnergyEstimate ? "radio-selected-div" : "radio-div"}">
        <BatteryCharging90 size="100%"/>
    </div>
    
</label><br>High
</td></tr></table>
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
    .energy-use-input {
        font-size: 30pt;
        width: 70%;
        height: 1.5em;
        appearance: textfield;
        text-align: center;
        border-radius: 0.5em;
        border: 4px inset ButtonBorder;
        background-color: var(--plblue);
    }
    .energy-use-input:focus {
        background-color: greenyellow;
    }

    div {
        text-align: center;
    }
    .unsure-div {
        margin: auto;
        width: 60%;
        height: 4em;
        background-color: var(--plblue);
        border-radius: 10px;
        box-shadow: 0px 3px 3px 2px rgba(0, 0, 0, 0.2);
        transition-property: box-shadow;
        transition: 0.1s;
    }
    .unsure-div:active {
        background-color: greenyellow;
        box-shadow: inset 0 3px 5px 5px rgba(0, 0, 0, 0.4);
    }
    .checked-div {
        margin: auto;
        width: 35%;
        background-color: var(--plblue);
        border-radius: 10%;
        box-shadow: 0px 0px 0px white, inset 1px 1px 2px 2px rgba(41, 76, 91, 0.5);
        transition-property: box-shadow;
        transition: 0.2s;
        padding: 2px;
    }
    .check-div {
        margin: auto;
        width: 35%;
        background-color: white;
        border-radius: 10%;
        box-shadow: 2px 2px 1px 2px rgba(0, 0, 0, 0.2), inset 0px 0px 0px white;
        transition-property: box-shadow;
        transition: 0.2s;
        padding: 2px;
    }

    .radio-selected-div {
        margin: auto;
        width: 70%;
        background-color: var(--plblue);
        border-radius: 10%;
        box-shadow: 0px 0px 0px white, inset 1px 1px 2px 2px rgba(41, 76, 91, 0.5);
        transition-property: box-shadow;
        transition: 0.2s;
        padding: 2px;
    }

    .radio-div {
        margin: auto;
        width: 70%;
        background-color: var(--plblue);
        border-radius: 10%;
        box-shadow: 0px 3px 3px 2px rgba(0, 0, 0, 0.2);
        transition-property: box-shadow;
        transition: 0.1s;
    }
    .choice-options {
        width: 100%;
        text-align: center;
        table-layout: fixed;
        height: auto;
    }
    td {
        text-align: center;
    }
    tr {
        text-align: center;
    }
    h2 {
        text-align: center;
    }
    .check-icon {
        display: none;
    }
</style>

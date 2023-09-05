<script>
    import BatteryChargingOutline from "svelte-material-icons/BatteryChargingOutline.svelte"
    import SolarPowerVariantOutline from "svelte-material-icons/SolarPowerVariantOutline.svelte"
    import EvStation from "svelte-material-icons/EvStation.svelte"
    import HomeLightningBolt from "svelte-material-icons/HomeLightningBolt.svelte"
    
    export let queryParams;


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
<div class="inner-div">
    <h2>I'm looking for</h2>
    <table class="choice-options">
        <tr>
            <td>
                <label>Battery<br>
                    <input class="check-icon" type="checkbox" name="Battery" bind:checked={queryParams.battery}>
                    <div class={queryParams.battery ? "checked-div" : "check-div"}>
                        <BatteryChargingOutline size="100%" color={queryParams.battery ? "var(--plblue)": "black"}/>
                    </div>
                </label>
            </td>
            <td>
                <label>Solar<br>
                    <input class="check-icon" type="checkbox" name="Solar" bind:checked={queryParams.solar}>
                    <div class={queryParams.solar ? "checked-div" : "check-div"}>
                        <SolarPowerVariantOutline size="100%"/>
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
                        <EvStation size="100%"/>
                    </div>
                </label>
            </td>
            <td>
                <label>
                UPS<br>
                <input class="check-icon" type="checkbox" name="UPS" bind:checked={queryParams.epsups}>
                <div class={queryParams.epsups ? "checked-div" : "check-div"}>
                    <HomeLightningBolt size="100%"/>
                </div>
                </label>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <label>
                    I'm not sure<br>
                    <input class="check-icon" type="checkbox" name="UPS" bind:checked={queryParams.epsups}>
                    <div class={queryParams.epsups ? "checked-div" : "check-div"}>
                        <HomeLightningBolt size="100%"/>
                    </div>
                    </label>
            </td>
        </tr>
    </table>
</div>
<div class="inner-div">
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
<style>
    .checked-div {
        margin: auto;
        width: 35%;
        background-color: greenyellow;
        border-radius: 10%;
        box-shadow: inset 0 3px 5px 5px rgba(0, 0, 0, 0.4);
        transition-property: box-shadow;
        transition: 0.1s;
    }
    .check-div {
        margin: auto;
        width: 35%;
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

<script lang="ts">
    import { queryParameters, ssp } from "sveltekit-search-params"
    import LoadableInput from "./LoadableInput.svelte";

    // algorithm for pricing to follow - use estimates of usage and solar power per day/month
    // get an estimate that includes increased consumption/lower solar in winter - more bought from grid

    // static values for data from other pages
    let offPeak = true;  // do they have an off peak teriff
    let solarEnergy = 1500; // kwh per year
    let energyUse = 2900;  // kwh per year
    let solarTariffType = "SEG";  // SEG or FIT
    let winterUsage = "higher"; // higher, lower, the same
    let dailyUsagePattern = "day";  // day, night, the same
    
    // starting values for data from this page
    let peakTariff = 0.47;
    let offPeakTeriff = 0.18;
    let offPeakRatio=0.2;  // ratio of power currently used off peak

    // calculated values (hard coded for now)
    let offPeakSavings = 1000;
    let offPeakPotentialSavings = "800";

    // stages of savings screen
    let savingStage = 0;
    let stages = ["Your Savings", "Your tariff", "Your rates", "Your usage"]

    // questions asked
    /*
        Type of tariff (fixed, variable, economy 7/10 (off peak), others?)
        tariff rates (fixed, average, peak/offpeak)
    */

    // process:
    /*
        ask what kind of tariff
        ask tariff rates if know (lots of conditionals)
        calculate savings
        if not on off peak tariff, use est. tariff for region to calculate how much they could save with an off peak tariff

        
        right hand box: showing calculations for how much they could save and when
    */
 
</script>
<div class="savings-screen">
    <div>
    <div class="side-bar">
        {#each stages as stage, i}
            <div class="side-bar-stage">
                <p >{stage}</p>
            </div>
        {/each}
    </div>
</div>
    <div class="grid-container">
        <div id="offPeakSavingsDiv" class="info-box">
            <input type="checkbox" bind:checked={offPeak}>
            <h1>Your savings!</h1>
            <!--
                Show initial savings from using solar/buying off peak
            -->
            {#if offPeak}
                <h2>Off peak savings £{offPeakSavings} per year!</h2>
            {:else}
                <h2>Consider switching to an off peak tariff</h2>
                <p>
                    You could save around £{offPeakPotentialSavings} per year!
                </p>
            {/if}
        </div>
    </div>
</div>

<style>
    :root {
        --pl-blue: #28AAE2;
    }
    .savings-screen {
        display: grid;
        grid-template-columns: 1fr 4fr;
        gap: 5px;
    }
    .side-bar {
        background-color: #189ad2;
        padding: 4px;;

    }
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0px;
    }

    .info-box {
        border: 1px solid black;
    }
    .side-bar-stage {
        height: 5vh;
        margin:auto;
        margin-top: 2px;
        margin-bottom: 2px;;
        border: 1px solid black;
        background-color: var(--pl-blue);
        
    }
    .side-bar-stage:hover {
        background-color: #38baf2;
    }
</style>
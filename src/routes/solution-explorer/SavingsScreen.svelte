<script lang="ts">
    import { queryParameters, ssp } from "sveltekit-search-params"
    import LoadableInput from "./LoadableInput.svelte";

    // algorithm for pricing to follow - use estimates of usage and solar power per day/month
    // get an estimate that includes increased consumption/lower solar in winter - more bought from grid

    // static values for data from other pages
    let offPeak = true;  // do they have an off peak teriff
    let solarEnergy = 1500; // kwh per year
    let energyUse = 2900;  // kwh per year
    let tariffType = "SEG";  // SEG or FIT
    let winterUsage = "higher"; // higher, lower, the same
    let dailyUsagePattern = "day";  // day, night, the same
    
    // starting values for data from this page
    let peakTariff = 0.47;
    let offPeakTeriff = 0.18;
    let offPeakRatio=0.2;  // ratio of power currently used off peak

    // calculated values (hard coded for now)
    let offPeakSavings = 1000;
    let offPeakPotentialSavings = "800";
 
</script>


<div class="grid-container">
    <div id="offPeakSavingsDiv" class="info-box">
        <input type="checkbox" bind:checked={offPeak} on:click={() => console.log(offPeak)}>
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

<style>
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        width: 80%;
        margin-left: auto;
        margin-right: auto;
    }

    .info-box {
        
    }
</style>
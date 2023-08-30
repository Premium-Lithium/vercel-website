<script lang="ts">
    import { queryParameters, ssp } from "sveltekit-search-params"
    import { energySavings } from "./energySavingsCalculator"

    // algorithm for pricing to follow - use estimates of usage and solar power per day/month
    // get an estimate that includes increased consumption/lower solar in winter - more bought from grid

    // static values for data from other pages
    let tariffType = "Off-Peak";  // string: specific type of tariff
    let solarEnergy = 3500; // kwh per year
    let energyUse = 4900;  // kwh per year
    let winterUsage = "higher"; // higher, lower, the same
    let dailyUsagePattern = "day";  // day, night, the same?
    let offPeakStart = 0;
    let offPeakEnd = 7; 
    
    // starting values for data from this page
    let offPeak;
    $: offPeak = tariffType === "Off-Peak";
    let peakTariff = 0.47;
    let offPeakTariff = 0.18;
    let sellTariff = 0.08;
    let offPeakRatio=0.2;  // ratio of power currently used off peak
    let supplier = "octopus";
    let totalCost = 5000;
    let batterySize = 10;

    let savings = energySavings(energyUse, solarEnergy, batterySize, totalCost, peakTariff, offPeakTariff, tariffType, offPeakRatio, supplier)
    console.log(savings);
    let solarSavings = savings[0];
    let batterySavings = savings[1];
    let soldEnergy = savings[2];
    let totalSavings = savings[3];
    let payback = savings[4]

    // calculated values (hard coded for now)
    let offPeakSavings = 1000;
    let offPeakPotentialSavings = "800";

    let avgDayEnergy = energyUse / 365.25;
    let energyByHour = Array(24).fill((avgDayEnergy/24).toFixed(4));
    

    // stages of savings screen
    let savingStage = 2;
    let stages = ["Your tariff", "Your usage", "Solar power","Your Savings"]

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
    
    let tariffButtonOptions = [  // each is [<string>, <tis tariff>]
        "Fixed",
        "Variable",
        "Off-Peak",
        "Capped",
        "Pre-Payment"
    ] 

    function tariffSelected(type) {
        // set tariff type locally
        // set tariff type in url (later)
        // slightly different wording for next section,
        tariffType = type;
    }

    let customizeDayEnergyVisible = false;
    let customizeMonthEnergyVisible = false;

</script>
<div class="savings-screen">
    <div>
    <div class="side-bar">
        {#each stages as stage, i}
            <button class="side-bar-stage" on:click={() => savingStage = i}>
                <p>{savingStage === i ? ">":""}{stage}</p>
            </button>
        {/each}
    </div>
</div>
    <div class="grid-container">
        <div id="questions">

            {#if stages[savingStage] == "Your tariff"}
                <p>What tariff type are you paying for you electricity?</p>
                {#each tariffButtonOptions as option, i}
                    <button class:selected={tariffType === option} class="tariff-button" on:click={() => tariffSelected(option)}>{option}</button>
                {/each}
                <br>
                
                {#if tariffType === "Off-Peak"}
                <p>What are your electricity rates?</p>
                
                    <form>
                        <label>Daytime £<input bind:value={peakTariff}> /kwh</label><br>
                        <label>Nighttime £<input bind:value={offPeakTariff}> /kwh</label><br>
                        <label>Night start<input type="range" min=0 max=24 step=1 bind:value={offPeakStart}></label>{offPeakStart}<br>
                        <label>Night end<input type="range" min=0 max=24 step=1 bind:value={offPeakEnd}></label>{offPeakEnd}<br>
                    </form>
                    <br><button on:click={() => savingStage++}>Go!</button>
                {:else if tariffType == null}
                    <br>
                {:else}
                    <label>Energy rate £<input bind:value={peakTariff}> /kwh</label>
                    <br><button on:click={() => savingStage++}>Go!</button>
                {/if}
                
            {:else if stages[savingStage] === "Your usage"}
                <p> Energy usage patterns</p>
                {#if offPeak}
                    <label>Ratio of off peak use?<input type="number" step=0.1 bind:value={offPeakRatio}></label>
                {/if}
                <p>Daily energy usage</p>
                <div class="energyDiv">
                    <div>More energy during:<br>
                        <label><input name="energyTime" value="day" type="radio">Daytime</label><br>
                        <label><input name="energyTime" value="night" type="radio">Nighttime</label><br>
                        <label><input name="energyTime" value="none" type="radio">Neither</label><br>
                    </div>
                    <div>
                        <button on:click={() => customizeDayEnergyVisible = !customizeDayEnergyVisible}>Customize></button>
                        {#if customizeDayEnergyVisible}
                            <div class="customise-energy">
                                Customisable bar chart goes here?
                            </div>
                        {/if}
                    </div>
                </div>
                <p>Monthly energy usage</p>
                <div class="energyDiv">
                
                <div>More energy during:<br>
                    <label><input name="energyMonth" value="summer" type="radio">Summer</label><br>
                    <label><input name="energyMonth" value="winter" type="radio">Winter</label><br>
                    <label><input name="energyMonth" value="none" type="radio">Neither</label><br>
                </div>
                <div>
                    <button on:click={() => customizeMonthEnergyVisible = !customizeMonthEnergyVisible}>Customize></button>
                    {#if customizeMonthEnergyVisible}
                        <div class="customise-energy">
                            Customisable bar chart goes here?
                        </div>
                    {/if}
                </div>
            </div>
            {:else if stages[savingStage] === "Solar power"}
                <p>Solar energy returns, comparison of battery to no battery</p>
                <label>Export value £<input type="number" step=0.01 bind:value={sellTariff}> /kwh</label>
                <p>Estimate of Savings + income without battery</p>
                <p><strong>Estimate of savings with battery</strong></p>

            {:else if stages[savingStage] === "Your Savings"}
                <p><strong>Your savings!</strong></p>
                <p>With just solar you could save £{solarSavings}</p>
                <p>With a {batterySize} kWh battery you could save £{batterySavings} by buying only off peak energy</p>
                <p>With solar and a battery you could save £{totalSavings}</p>
                <p>By switching to an off-peak tariff, you could save...</p>
                <p>You could payback the installation cost in {payback} years! </p>
            {/if}
        </div>
        <div id="offPeakSavingsDiv" class="info-box">
            <input type="checkbox" bind:checked={offPeak}>
            <h1>Your savings!</h1>
            
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
    *{
        z-index: auto;
    }
    .customise-energy {
        width: 200%;
        height: 200%;
        background-color: #189ad2;
        position: relative;
    }
    .energyDiv {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3px;
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
        width: 100%;
        margin: auto;
        margin-top: 2px;
        margin-bottom: 2px;;
        border: 1px solid black;
        background-color: var(--plblue);
        
    }
    .side-bar-stage:hover {
        background-color: #38baf2;
    }
    .side-bar-stage:active {
        background-color: blue;
    }
    .tariff-button {
        background-color: var(--plblue);
    }
    .tariff-button.selected {
        border: 10px solid white;
        background-color: blue;
        color: white;
    }
    #questions {
        border: 1px solid black;
    }
</style>

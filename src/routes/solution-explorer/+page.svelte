<script lang="ts">
  import { ssp, queryParam, queryParameters} from "sveltekit-search-params"

  import Map from '$lib/components/Map.svelte';
  import Savings from "$lib/components/Savings.svelte";
  import NavButtons from "$lib/components/NavButtons.svelte";
  import Loading from "$lib/components/Loading.svelte";

  import Solution3DView from './Solution3DView.svelte'
  import ProgressHeader from "./ProgressHeader.svelte"
  
  import EnergyStage from "./EnergyStage.svelte"
  import SolarGenerationBreakdown from "./SolarGenerationBreakdown.svelte";
  import Investments from "./Investments.svelte";
  import SavingsScreen from "./SavingsScreen.svelte";
	import { GetDealsSummaryDataWeightedValuesTotal, Stage } from "pipedrive";
	import { onMount } from "svelte";

	import ExpandBar from "./ExpandBar.svelte";

  const stage = queryParam("stage", ssp.number())
  let map;
  let peakSolarPower = 8.8;
  let solarLoss = 14;
  let solarAngle = 45;
  let solarAzimuth = 0; // 0=south, -90=east, 180=north, 90=west
  let mapboxSearchResult = {"latitude": 53.95924825020342, "longitude":-1.0772513524147558};
  let monthlySolarGenerationValues = [];
  let loadingSolarValues = false;

const allQueryParameters = queryParameters({
    // energy stage params
    battery: ssp.boolean(),
    solar: ssp.boolean(),
    ev: ssp.boolean(),
    epsups: ssp.boolean(),
    energyUsage: ssp.number(),
    isEnergyUsageExact: ssp.boolean(),
    moreWinterUsage: ssp.boolean(),
    workFromHome: ssp.boolean(),
    oilAndGas: ssp.boolean(),
    highConsumptionDevices: ssp.boolean(),
    // solar stage params
    peakSolarPower: ssp.number(8.8),
    solarLoss: ssp.number(15),
    solarAngle: ssp.number(45),
    solarAzimuth: ssp.number(0),
    monthlySolarGenerationValues: ssp.array(),
    mapboxSearchParams: ssp.object({"latitude": 53.95924825020342, "longitude":-1.0772513524147558})


});
// prevent negative pages
onMount(() => {
    if ($stage == null) {
        $stage = 0;
    }
    if($stage < 0) {
        $stage = 0;
    }
});


  const solution = {houseType: "detatched", solar: {selected: true, minPannels: 0, maxPannels:20, selectedPannels: 0}, battery: true, batterySize_kWh: 5, evCharger: {selected: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: "",  addOns: {ups: true, evCharger: false, smartBattery: false, birdGuard: false}};
</script>  
<body>
  <div class="progressHeader">
      <ProgressHeader
          titles={["Energy", "Solar", "Savings", "Investment"]}
          bind:selectedIndex={$stage}
      />
  </div>
    {#if $stage === 0}
        <EnergyStage
            bind:queryParams={$allQueryParameters}
           
        />
    {:else if $stage === 1}
   
        <div class="map-view"> 
          <Map search={true} style=5 bind:map bind:searchResult={mapboxSearchResult}/>
        </div>
        <div class="solar-api">
          <label for="peakSolarPower">Peak Solar Power</label>
          <input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={peakSolarPower}>
          <label for="solarLoss">Solar Loss</label>
          <input type="number" id="solarLoss" name="solarLoss" bind:value={solarLoss}>
          <label for="solarAngle">Solar Panel Angle</label>
          <input type="number" id="solarAngle" name="solarAngle" bind:value={solarAngle}/>
          <label for="solarAzimuth">Solar Panel Azimuth</label>
          <input type="number" id="solarAzimuth" name="solarAzimuth" bind:value={solarAzimuth}/>
          <input type="submit" value="Submit" on:click={async () => {
            monthlySolarGenerationValues = [];
            loadingSolarValues = true;
            let res = await fetch('solution-explorer/', {
              method: "POST",
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                'requestType': 'PVGIS',
                'lat': mapboxSearchResult.latitude,
                'lon': mapboxSearchResult.longitude,
                'peakPower': peakSolarPower,
                'loss': solarLoss,
                'angle': solarAngle,
                'azimuth': solarAzimuth,
              })
            });
            res = await res.json();
            loadingSolarValues = false;
            console.log(res);
            res.outputs.monthly.fixed.forEach((x) => {
              monthlySolarGenerationValues = [...monthlySolarGenerationValues, x.E_m];
            })
          }}> 
          {#if loadingSolarValues}
          <Loading/>
          {:else}
          <SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues}/>
          {/if}
        </div>

    {:else if $stage === 2}
      <SavingsScreen/>
    {:else if $stage === 3}
        <Investments solution={solution}/>

    {:else}
        <div class="modelView">
            3d model goes here
        </div>
        <div class="questions">
          questions here
        </div>
        <!-- <Solution3DView /> -->
        <!-- REVIEW -->
    {/if}
      <div class="savings">
        <ExpandBar />
      </div>
      <div class="footer">
        <NavButtons bind:currentPage={$stage} lastPage={6}/>
    </div>
</body>

<style>

  .progressHeader{
    height: 5%;
  }
  .map-view {
    width: 100vw;
    height: 40vh;
  }
  .solar-api {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90vw;
    margin: 20px 5vw;
    
    position: relative;
  }

  .modelView{
    overflow-y: hidden;
    background-color: var(--plblue);
    height: 30%;
  }

  .questions{
    overflow-y: hidden;
    background-color: rgb(224, 224, 224);
    height: 45%
  }
  .savings{
    height: 10%;
    display: flex;
    overflow-y: visible;
    background-color: chartreuse;
  }

  .footer{
    height: 10%;
    width: 100%;
    position: absolute;
    background-color: aliceblue;
    bottom: 0;
    overflow: hidden;
  }


</style>

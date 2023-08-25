<script>
    import { ssp, queryParam} from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";


    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import SampleComponents from "./SampleComponents.svelte"
    import EnergyStage from "./EnergyStage.svelte"

    const stage = queryParam("stage", ssp.number())
    let map;
    let peakSolarPower = 8.8;
    let solarLoss = 14;
    let mapboxSearchResult = {"latitude": 53.95924825020342, "longitude":-1.0772513524147558};
    let output;

    const battery = queryParam("battery", ssp.boolean())
    const solar = queryParam("solar", ssp.boolean())
    const ev = queryParam("ev", ssp.boolean())
    const epsups = queryParam("epsups", ssp.boolean())
    const energyUsage = queryParam("energyusage", ssp.number())
    const isEnergyUsageExact = queryParam("isenergyusageexact", ssp.boolean())
    const moreWinterUsage = queryParam("morewinterusage", ssp.boolean())
    const workFromHome = queryParam("workfromhome", ssp.boolean())
    const oilAndGas = queryParam("oilandgas", ssp.boolean())
    const highConsumptionDevices = queryParam("highconsumptiondevices", ssp.boolean())

</script>

<body>
    <ProgressHeader
        titles={["Energy", "Solar", "Savings", "Investment"]}
        selectedIndex={$stage}
    />
    {#if $stage === 0}
        <EnergyStage
            bind:battery={$battery}
            bind:solar={$solar}
            bind:ev={$ev}
            bind:epsups={$epsups}
            bind:energyUsage={$energyUsage}
            bind:isEnergyUsageExact={$isEnergyUsageExact}
            bind:moreWinterUsage={$moreWinterUsage}
            bind:workFromHome={$workFromHome}
            bind:oilAndGas={$oilAndGas}
            bind:highConsumptionDevices={$highConsumptionDevices}
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
          <input type="submit" value="Submit" on:click={async () => {
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
              })
            });
            console.log(await res.json());
          }}>
        </div>

    {:else if $stage === 2}
        <SampleComponents />

    {:else}
        <Solution3DView />
        REVIEW
    {/if}
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
</body>

<style>
  .map-view {
    width: 100vw;
    height: 25vh;
  }
  .solar-api {
    width: 90vw;
    left: 5vw;
    position: relative;
    margin: 40px;
  }
</style>

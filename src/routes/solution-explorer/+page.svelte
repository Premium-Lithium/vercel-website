<script>
    import { ssp, queryParam } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
  
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"

    import { queryPV } from './solarAPI';
    const stage = queryParam("stage", ssp.number())
    let peakSolarPower = 8.8;
    let solarLoss = 14;
    let output;
    let latitude = 53.95924825020342;
    let longitude = -1.0772513524147558;
</script>

<!-- todo: arrange in new layout and make responsive -->
<body>
    <ProgressHeader
        titles={["map", "3d", "result"]}
        selectedIndex={$stage}
    />
    {#if $stage === 0}
        <div class="map-view">
          <Map search={true} style=5/>
        </div>
        <div class="solar-api">
          <label for="peakSolarPower">Peak Solar Power</label>
          <input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={peakSolarPower}>
          <label for="solarLoss">Solar Loss</label>
          <input type="number" id="solarLoss" name="solarLoss" bind:value={solarLoss}>
          <input type="submit" value="Submit" on:click={async () => {queryPV(latitude, longitude, peakSolarPower, solarLoss)}}>
        </div>
    {:else if $stage === 1}
        <Solution3DView />
    {:else}
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

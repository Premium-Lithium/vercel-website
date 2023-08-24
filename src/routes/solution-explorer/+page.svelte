<script>
    import { ssp, queryParam } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
  
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import EnergyStage from "./EnergyStage.svelte"

    const stage = queryParam("stage", ssp.number())

    const battery = queryParam("battery", ssp.boolean())
    const solar = queryParam("solar", ssp.boolean())
    const ev = queryParam("ev", ssp.boolean())
    const epsups = queryParam("epsups", ssp.boolean())

</script>

<!-- todo: arrange in new layout and make responsive -->
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
        />
    {:else if $stage === 1}
        <div class="map-view">
          <Map search={true} style=5/>
        </div>
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
</style>

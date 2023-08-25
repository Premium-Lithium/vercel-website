<script>
    import { ssp, queryParam} from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";


    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import SampleComponents from "./SampleComponents.svelte"
	

    const stage = queryParam("stage", ssp.number());
    
    
   
</script>

<div>
    <ProgressHeader
        titles={["map", "3d", "result"]}
        selectedIndex={$stage}
    />
    {#if $stage === 0}
        <div class="map-view">
          <Map search={true} style=5/>
        </div>
    {:else if $stage === 1}
        <Solution3DView />
    {:else if $stage === 2}
        <SampleComponents />
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
</style>

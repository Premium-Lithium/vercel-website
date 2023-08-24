<script>
    import { ssp, queryParam } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
  
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"

    const stage = queryParam("stage", ssp.number())

</script>

<!-- todo: arrange in new layout and make responsive -->
<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={$stage}
    />
    <Solution3DView />
    <div class="map-view">
      <Map search={true} style=5/>
    </div>
    <h2> currentPage: {$stage}</h2>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</body>

<style>
  .map-view {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: calc(100vw - 20px);
    height: 30vh;
  }
</style>
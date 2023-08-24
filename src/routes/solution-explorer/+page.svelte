<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"

    onMount(async () => {
    });
    let currentPage = 1
</script>

<!-- todo: arrange in new layout and make responsive -->
<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    <Solution3DView />
    <div class="map-view">
      <Map search={true}/>
    </div>
    <h2> currentPage: {currentPage}</h2>
    <NavButtons bind:currentPage lastPage={5}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</body>

<style>
  .map-view {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 25vh;
  }
</style>
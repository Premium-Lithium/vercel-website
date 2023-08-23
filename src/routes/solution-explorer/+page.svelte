<script>
    import { onMount } from 'svelte';

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
    import ProgressHeader from "./ProgressHeader.svelte"
    import { stage } from "./store"

    onMount(async () => {
    });
</script>

<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={$stage}
    />
    <div class="map-view">
      <Map search={true}/>
    </div>
    <h2> currentPage: {$stage}</h2>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
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

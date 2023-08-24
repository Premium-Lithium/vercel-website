<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";

    import ProgressHeader from "./ProgressHeader.svelte"

    onMount(async () => {
    });
    let currentPage = 1
</script>

<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    <div class="map-view">
      <Map search={true} style=5/>
    </div>
    <h2> currentPage: {currentPage}</h2>
    <NavButtons bind:currentPage lastPage={5}/>
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

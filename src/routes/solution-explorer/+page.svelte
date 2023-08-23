<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';

    import ProgressHeader from "./ProgressHeader.svelte"

    onMount(async () => {
    });
</script>

<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    <div class="map-view">
      <Map search={true}/>
    </div>
    solution explorer here
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

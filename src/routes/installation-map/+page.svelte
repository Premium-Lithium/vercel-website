<script lang="ts">
	import Map from "$lib/components/Map.svelte";
    let map;
    let mapZoom = 4;
</script>

<div>
	<h1>Installation Map</h1>
    <div class="map-view">
        <Map search={false} style=4 bind:map={map} zoom={mapZoom} --border-radius='10px'></Map>
    </div>
</div>

<style>
    .map-view{
        width: 100%;
        height: 80vh;
    }
</style>

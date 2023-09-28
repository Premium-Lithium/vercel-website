<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import mapboxgl from 'mapbox-gl';
	import { onMount } from 'svelte';
	let map;
	let mapZoom = 4;

	let postcodes = [['ls1 2fn', 'ls2 8fj']];

	let longlats = { 'ls1 2fn': [53.79905, -1.55458], 'ls2 8fj': [53.80119, -1.54205] };

</script>

<div>
	<h1>Installation Map</h1>
	<div class="map-view">
		<Map search={false} style={2} bind:map zoom={mapZoom} --border-radius="10px" />
	</div>
</div>

<style>
	.map-view {
		width: 100%;
		height: 80vh;
	}
</style>

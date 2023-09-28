<script lang="ts">
	import Map from '$lib/components/Map.svelte';
    import { latLongOfMarker } from '$lib/MapStores';
	let map;
	let mapZoom = 4;
	let style = 5;

    // Completely necessary function
	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}

    let york = [{latitude: 53.9614, longitude: 1.0739},
                {latitude: 53.8008, longitude: 1.5491}    
];

</script>

<div>
	<h1>Installation Map</h1>
	<div class="map-view">
		{#key style}
			<Map search={false} bind:style bind:map zoom={mapZoom} --border-radius="10px" markerArr={york}/>
		{/key}
	</div>
	<div id="styleButton">
		<button on:click={changeStyle}>Change Style</button>
	</div>
</div>

<style>
	.map-view {
		width: 100%;
		height: 80vh;
	}
</style>

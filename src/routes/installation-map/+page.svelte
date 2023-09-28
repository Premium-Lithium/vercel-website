<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	let map;
	let mapZoom = 4;
	let style = 5;

	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}
</script>

<div>
	<h1>Installation Map</h1>
	<div class="map-view">
		{#key style}
			<Map search={false} bind:style bind:map zoom={mapZoom} --border-radius="10px" />
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

<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	let map;
	let style = 5;
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

	// Completely necessary function
	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}
	let installations = [
		{name:"House 3", address:'86 Poppleton Road, York, YO26 4UP', status:"Survey"},
		{name:"House 1", address:'37 Crossways, York, YO10 5JH', status:"Survey Confirmed"},
		{name:"House 2", address:'18 Malton Avenue, York, YO31 7TT', status:"Installation"},
		{name:"Work 1", address:'Quartz Point, 13 The Stonebow, York YO1 7NP', status:"DNO Completed"}
	];


</script>

<div>
	<h1>Installation Map</h1>
	<div class="map-view">
		{#key style}
			<Map
				search={false}
				bind:style
				bind:map
				--border-radius="10px"
				installationArr={installations}
			/>
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

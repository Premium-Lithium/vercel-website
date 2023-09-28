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
	let addresses = [
		'86 Poppleton Road, York, YO26 4UP',
		'37 Crossways, York, YO10 5JH',
		'18 Malton Avenue, York, YO31 7TT',
		'Quartz Point, 13 The Stonebow, York YO1 7NP'
	];

	async function fetchLatlonFromAddress(address) {
		const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
		try {
			const geocodingResponse = await fetch(endpoint);
			if (geocodingResponse.ok) {
				const data = await geocodingResponse.json();
				const latLong = [
					data.features[0].geometry.coordinates[1],
					data.features[0].geometry.coordinates[0]
				];
				return latLong;
			} else {
				console.error('Bad Response');
			}
		} catch (error) {
			console.error('Bad Catch');
		}
	}

	function GetLatLongsFromAddress(addressArr) {
		let latLongArr = [];
		for (let i in addressArr) {
			let latLongFromAddress = fetchLatlonFromAddress(addressArr[i]);
			latLongFromAddress.then((value) => {
				latLongArr.push(value);
			});
		}
		return latLongArr;
	}
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
				markerArr={GetLatLongsFromAddress(addresses)}
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

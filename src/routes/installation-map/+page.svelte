<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { latLongOfMarker } from '$lib/MapStores';
	import { onMount } from 'svelte';
	let map;
	let mapZoom = 4;
	let style = 5;

	// Completely necessary function
	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}
	let addresses = [
		'Hillcrest farm, Scottshill, Outwood, Surrey, RH1 5PR',
		'Quartz Point, 13 The Stonebow, York YO1 7NP'
	];

	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
	async function fetchLatlonFromAddress(address) {
		try {
			const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
			const geocodingResponse = await fetch(endpoint);
			if (geocodingResponse.ok) {
				const data = await geocodingResponse.json();
				const latLong = {
					latitude: data.features[0].geometry.coordinates[1],
					longitude: data.features[0].geometry.coordinates[0]
				};
				return latLong;
			} else {
				console.error('Bad Response');
			}
		} catch (error) {
			console.error('Bad Catch');
		}
	}
    
    let latLongArr = [];
    function GetLatLongsFromAddress(addressArr) {
        for (let i in addressArr) {
            let latLongFromAddress = fetchLatlonFromAddress(addressArr[i]);
            latLongFromAddress.then((value) => {
                latLongArr.push(value);
            });
        }
    }
    GetLatLongsFromAddress(addresses)

</script>

<div>
	<h1>Installation Map</h1>
	<div class="map-view">
		{#key style}
			<Map
				search={false}
				bind:style
				bind:map
				zoom={mapZoom}
				--border-radius="10px"
				markerArr={latLongArr}
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

<script lang="ts">
	import { latLongOfMarker, markersOnMap } from '$lib/MapStores.js';
	import mapboxgl from 'mapbox-gl';
	import SolarGenerationBreakdown from './SolarGenerationBreakdown.svelte';
	import Loading from '$lib/components/Loading.svelte';
    
	export let map;
	export let loadingSolarValues = false;
	export let allQueryParameters;
	
	const JINKO_PANEL_SIZE = 1.762 * 1.134; // m^2 

	let monthlySolarGenerationValues = [];

</script>

<div class="solar-api">
	<label for="peakSolarPower">Peak Solar Power</label>
	<input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={allQueryParameters.peakSolarPower}>
	<label for="solarLoss">Solar Loss</label>
	<input type="number" id="solarLoss" name="solarLoss" bind:value={allQueryParameters.solarLoss}>
	<label for="solarAngle">Solar Panel Angle</label>
	<input type="number" id="solarAngle" name="solarAngle" bind:value={allQueryParameters.solarAngle}/>
	<label for="solarAzimuth">Solar Panel Azimuth</label>
	<input type="number" id="solarAzimuth" name="solarAzimuth" bind:value={allQueryParameters.solarAzimuth}/>
	<input type="submit" value="Submit" on:click={async () => {
		$markersOnMap.forEach((m) => {if(m._color != 'blue') m.remove()});
		$markersOnMap.filter((m) => m._color == 'blue');
	  	monthlySolarGenerationValues = [];
		loadingSolarValues = true;
		let pvgisRes = await fetch('solution-explorer/endpoints/solar/', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			'requestType': 'PVGIS',
			'lat': $latLongOfMarker.latitude,
			'lon': $latLongOfMarker.longitude,
			'peakPower': allQueryParameters.peakSolarPower,
			'loss': allQueryParameters.solarLoss,
			'angle': allQueryParameters.solarAngle,
			'azimuth': allQueryParameters.solarAzimuth,
			})
		});
		pvgisRes = await pvgisRes.json();
		loadingSolarValues = false;
		console.log(pvgisRes);
		pvgisRes.outputs.monthly.fixed.forEach((x) => {
			monthlySolarGenerationValues = [...monthlySolarGenerationValues, x.E_m];
		})
		loadingSolarValues = true;
		let googleSolarRes = await fetch('solution-explorer/endpoints/solar', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			'requestType': 'GoogleSolar',
			'lat': $latLongOfMarker.latitude,
			'lon': $latLongOfMarker.longitude,
			})
		});
		googleSolarRes = await googleSolarRes.json();
		console.log(googleSolarRes);
		if(googleSolarRes.error) {
			console.log("No building found here");
			loadingSolarValues = false;
			return;
		}
		googleSolarRes.solarPotential.roofSegmentStats.forEach((roofSegment) => {
			const marker = new mapboxgl.Marker({
			color:"red"
			}).setLngLat([roofSegment.center.longitude, roofSegment.center.latitude])
			.addTo(map);
			
			const popup = new mapboxgl.Popup({ offset: 25 })
			.setText(`Max ${Math.floor(roofSegment.stats.areaMeters2 / JINKO_PANEL_SIZE)} panels`)
			.setLngLat([roofSegment.center.longitude, roofSegment.center.latitude]);

			marker.setPopup(popup);
			marker.getElement().addEventListener('mouseenter', () => marker.togglePopup());
			marker.getElement().addEventListener('mouseleave', () => marker.togglePopup());;
			$markersOnMap.push(marker);
		});
		loadingSolarValues = false;
		}}> 
		{#if loadingSolarValues}
		<Loading/>
		{:else}
		<SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues}/>
		{/if}
  </div>

<style>
	.solar-api {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 90vw;
		margin: 20px 5vw;
		position: relative;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

</style>

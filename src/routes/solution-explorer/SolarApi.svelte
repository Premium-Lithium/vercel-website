<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import SolarGenerationBreakdown from './SolarGenerationBreakdown.svelte';
	import Loading from '$lib/components/Loading.svelte';
	let mapboxSearchResult = { latitude: 53.95924825020342, longitude: -1.0772513524147558 };
    
	export let loadingSolarValues = false;
	export let allQueryParameters;

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
	  monthlySolarGenerationValues = [];
	  loadingSolarValues = true;
	  let pvgisRes = await fetch('solution-explorer/', {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		  'requestType': 'PVGIS',
		  'lat': mapboxSearchResult.latitude,
		  'lon': mapboxSearchResult.longitude,
		  'peakPower': allQueryParameters.peakSolarPower,
		  'loss': allQueryParameters.solarLoss,
		  'angle': allQueryParameters.solarAngle,
		  'azimuth': allQueryParameters.solarAzimuth,
		})
	  });
	  console.log(pvgisRes);
	  pvgisRes = await pvgisRes.json();
	  loadingSolarValues = false;
	  console.log(pvgisRes);
	  pvgisRes.outputs.monthly.fixed.forEach((x) => {
		  monthlySolarGenerationValues = [...monthlySolarGenerationValues, x.E_m];
	  })
	  loadingSolarValues = true;
	  let googleSolarRes = await fetch('solution-explorer/', {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		  'requestType': 'GoogleSolar',
		  'lat': mapboxSearchResult.latitude,
		  'lon': mapboxSearchResult.longitude,
		})
	  });
	  googleSolarRes = await googleSolarRes.json();
	  console.log(googleSolarRes);
	  googleSolarRes.solarPotential.roofSegmentStats.forEach((roofSegment) => {
		const marker = new mapboxgl.Marker({
		  color:"red"
		}).setLngLat([roofSegment.center.longitude, roofSegment.center.latitude])
		  .addTo(map);
	  });
	  console.log(googleSolarRes.solarPotential)
	  loadingSolarValues = false;
	}}> 
	{#if loadingSolarValues}
	<Loading/>
	{:else}
	<SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues}/>
	{/if}
  </div>

<div>
	{#if monthlySolarGenerationValues.length != 0}
		<!-- Replace this with "fill in previous form" or block user from swiping until submitted -->
		<SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues} />
	{:else if loadingSolarValues}
	<div class="loading">
		<Loading/>
	</div>
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

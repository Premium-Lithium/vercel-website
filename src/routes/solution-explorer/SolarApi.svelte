<script lang="ts">

	import SolarGenerationBreakdown from './SolarGenerationBreakdown.svelte';

	let mapboxSearchResult = { latitude: 53.95924825020342, longitude: -1.0772513524147558 };
    
	export let loadingSolarValues = false;
	export let allQueryParameters;

	let monthlySolarGenerationValues = [];

	console.log(allQueryParameters.monthlySolarGenerationValues);
</script>

<div class="solar-api">
	<label for="peakSolarPower">Peak Solar Power</label>
	<input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={allQueryParameters.peakSolarPower} />
	<label for="solarLoss">Solar Loss</label>
	<input type="number" id="solarLoss" name="solarLoss" bind:value={allQueryParameters.solarLoss} />
	<label for="solarAngle">Solar Panel Angle</label>
	<input type="number" id="solarAngle" name="solarAngle" bind:value={allQueryParameters.solarAngle} />
	<label for="solarAzimuth">Solar Panel Azimuth</label>
	<input type="number" id="solarAzimuth" name="solarAzimuth" bind:value={allQueryParameters.solarAzimuth} />
    <!-- Todo make this button also go to the next page -->
	<input
		type="submit"
		value="Submit"
		on:click={async () => {
			monthlySolarGenerationValues = [];
			loadingSolarValues = true;
			let res = await fetch('solution-explorer/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					requestType: 'PVGIS',
					lat: mapboxSearchResult.latitude,
					lon: mapboxSearchResult.longitude,
					peakPower: allQueryParameters.peakSolarPower,
					loss: allQueryParameters.solarLoss,
					angle: allQueryParameters.solarAngle,
					azimuth: allQueryParameters.solarAzimuth
				})
			});
			res = await res.json();
			loadingSolarValues = false;
			console.log(res);
			res.outputs.monthly.fixed.forEach((x) => {
				monthlySolarGenerationValues = [...monthlySolarGenerationValues, x.E_m];
			});
		}}
	/>
</div>

<div>
	{#if !loadingSolarValues}
		<!-- Replace this with "fill in previous form" or block user from swiping until submitted -->
		<SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues} />
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
</style>

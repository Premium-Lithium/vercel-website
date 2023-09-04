<script lang="ts">

	export let peakSolarPower = 8.8;
	export let solarLoss = 14;
	export let solarAngle = 45;
	export let solarAzimuth = 0; // 0=south, -90=east, 180=north, 90=west

</script>

<div class="solar-api">
	<label for="peakSolarPower">Peak Solar Power</label>
	<input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={peakSolarPower} />
</div>
<div class="solar-api">
	<label for="solarLoss">Solar Loss</label>
	<input type="number" id="solarLoss" name="solarLoss" bind:value={solarLoss} />
</div>
<div class="solar-api">
	<label for="solarAngle">Solar Panel Angle</label>
	<input type="number" id="solarAngle" name="solarAngle" bind:value={solarAngle} />
</div>
<div class="solar-api">
	<label for="solarAzimuth">Solar Panel Azimuth</label>
	<input type="number" id="solarAzimuth" name="solarAzimuth" bind:value={solarAzimuth} />
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

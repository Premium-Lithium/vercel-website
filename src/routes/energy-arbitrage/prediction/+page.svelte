<script lang="ts">
	// Energy Arbitrage
	let timestep = 0;
	let batteryInstruction;

	// Price forecast
	let importPrice = 0;
	let exportPrice = 0;

	// Energy Usage
	let usage = 0;

	// Solar Energy Generation - also takes timestep
	let gen = 0;
	let lon = 0;
	let lat = 0;
	let area = 0;
	let tilt = 0;
	let azimuth = 0;
	let generationForecast;

	async function sendTimestepGetInstruction() {
		const body = JSON.stringify(timestep);

		const instRes = fetch('/energy-arbitrage/prediction/arbitrage-calculation', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		instRes.then((responseBody) => {
			responseBody.json().then((respVal) => {
				batteryInstruction = respVal;
			});
		});

		const useRes = fetch('/energy-arbitrage/prediction/usage-forecast', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		useRes.then((responseBody) => {
			responseBody.json().then((respVal) => {
				usage = respVal;
			});
		});

		// TODO add required variables to request - 
		const genRes = fetch('/energy-arbitrage/prediction/generation-forecast', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		genRes.then((responseBody) => {
			responseBody.json().then((respVal) => {
				gen = respVal;
			});
		});

		const priceRes = fetch('/energy-arbitrage/prediction/price-forecast', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		priceRes.then((responseBody) => {
			responseBody.json().then((respVal) => {
				importPrice = respVal[0];
				exportPrice = respVal[1];
			});
		});
	}

</script>

<body>
	<h1>Prediction algorithm</h1>
	<p>
		Not a visible component on the final product, but we can use this to play around with sample
		data
	</p>
	<div>
		<h2>Energy Arbitrage Controller Inputs</h2>
		<label>
			Timestep:<input type="number" min="0" max="47" bind:value={timestep} />
		</label>
		<br />
		<button on:click={sendTimestepGetInstruction}>Get Instruction for Timestep</button>
		<br />
		<p>Timestep of Day (Jan 1st, 2021, split into half hours): {timestep * 0.5}h</p>
		<br />
		<p>Battery Instruction: {batteryInstruction === undefined ? 'No Instruction' : batteryInstruction}</p>
		<br />
		<p>Energy Usage: {usage} kWh</p>
		<br />
		<p>Energy Generation: {gen} kWh</p>
		<br />
		<p>Energy Import Price: {importPrice} p/kWh</p>
		<br />
		<p>Energy Export Price: {exportPrice} p/kWh</p>
		<br />
	</div>

	<!-- TODO implement after getting OpenWeatherAPIs -->
	<!-- <div>
		<h2>Solar Energy Generation</h2>
		<label>
			Longitude<input type="number" min={-90} max=90 bind:value={lon} />
		</label>
		<br />
		<label>
			Latitude<input type="number" min={-180} max=180 bind:value={lat} />
		</label>
		<br />
		<label>
			Solar Panel Area<input type="number" min=0 bind:value={area} />
		</label>
		<br />
		<label>
			Solar Panel Tilt<input type="number" min=0 bind:value={tilt} />
		</label>
		<br />
		<label>
			Solar Panel Azimuth<input type="number" min=0 bind:value={azimuth} />
		</label>
		<br />
		<button on:click={calculateSolarGeneration}> Get Solar Forecast</button>
	</div> -->
</body>

<style>
</style>

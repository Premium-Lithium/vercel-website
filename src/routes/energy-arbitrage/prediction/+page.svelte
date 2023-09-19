<script lang="ts">
	// Energy Arbitrage
	let timestep = 0;
	let batteryInstruction;

	// Solar Energy Generation
	let lon = 0;
	let lat = 0;
	let area = 0;
	let tilt = 0;
	let azimuth = 0;
	let generationForecast;

	async function sendTimestepGetInstruction() {
		const body = JSON.stringify(timestep);
		const res = fetch('/energy-arbitrage/prediction/arbitrage-calculation', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		res.then((responseBody) => {
			responseBody.json().then((respVal) => {
				batteryInstruction = respVal;
			});
		});
	}

	async function calculateSolarGeneration() {
		const body = JSON.stringify([lat, lon, area, tilt, azimuth]);
		const res = fetch('/energy-arbitrage/prediction/generation-forecast', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
		res.then((responseBody) => {
			responseBody.json().then((respVal) => {
				generationForecast = respVal;
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
		<h2>Energy Arbitrage Model</h2>
		<label>
			Timestep:<input type="number" min="0" max="48" bind:value={timestep} />
		</label>
		<br />
		<button on:click={sendTimestepGetInstruction}>Get Instruction for Timestep</button>
		<br />
		<p>{batteryInstruction === undefined ? 'No Instruction' : batteryInstruction}</p>
		<br />
	</div>

	<div>
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
	</div>
</body>

<style>
</style>

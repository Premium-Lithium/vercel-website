<script lang="ts">
	let timestep = 0;
	let batteryInstruction;

	async function sendTimestepGetInstruction() {
		const body = JSON.stringify(timestep);
		const resp = fetch('/energy-arbitrage/prediction/arbitrage-calculation', {
			method: 'POST',
			body: body,
			headers: {
				'content-type': 'application/json'
			}
		});
        resp.then((responseBody) => {
            responseBody.json().then(
                (respVal) => {
                    batteryInstruction = respVal;
                }
            )
        });
	}
</script>

<body>
	<h1>Prediction algorithm</h1>
	<p>
		Not a visible component on the final product, but we can use this to play around with sample
		data
	</p>
	<label>
		Timestep:<input type="range" min="0" max="48" bind:value={timestep} />{timestep}
	</label>
	<br />
	<button on:click={sendTimestepGetInstruction}>Get Instruction for Timestep</button>
	<br />
	<p>{batteryInstruction === undefined ? 'No Instruction' : batteryInstruction}</p>
</body>

<style>
</style>

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

	let energyBackupNeeded: Number|null = null;
	let backupDuration: Number|null = null;
	async function getEnergyNeeded () {
		// make call to backup duration to request the energy information
		// simple POST
		energyBackupNeeded = 1;
		
		const request = await fetch("/energy-arbitrage/prediction/backup-duration-calculation", {
			method: "POST",
			body: JSON.stringify({user: "placeholder"}),
			headers: {
				"content-type": "application-json"
      	  }
    	});
		const response = await request.json();

		energyBackupNeeded = response[0];
		backupDuration = response[1];
		
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
	<br>
	<h2>Battery duration calculation</h2>
	<table>
		<td>
			<button on:click={getEnergyNeeded}>Get energy needed</button>
		</td>
		<td>
			<p>
				{#if energyBackupNeeded === null}
					No energy calculation yet
				{:else}
					{energyBackupNeeded} kWh reserve storage, to last {backupDuration} hours
				{/if}
			</p>
		</td>
	</table>

</body>

<style>
</style>

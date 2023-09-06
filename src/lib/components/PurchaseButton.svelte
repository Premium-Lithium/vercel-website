<script>
	export let queryParams;

	/**
	 * Creates new lead on pipedrive
	 */
	async function addNewLead() {
		if (JSON.stringify(queryParams) !== undefined) {
			let request = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', accept: 'application/json' },
				body: JSON.stringify({
					title: 'Configurator Purchase',
					owner_id: 15800718,
					person_id: 0
				})
			};
			let res = await fetch('solution-explorer/submit/', request);
			res = await res.json();
			addLeadData(res);
		}
	}

	/**
	 * Adds data to the lead on pipedrive
	 * 	- adds query params to the notes page for now
	 */
	async function addLeadData(leadResponse) {
		console.log(leadResponse);
		let request = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', accept: 'application/json' },
			body: JSON.stringify({
				content: JSON.stringify(queryParams), // will fail the POST request if queryParams is empty, but won't crash horribly
				lead_id: leadResponse.data.id,
				add_time: leadResponse.data.update_time,
				person_id: leadResponse.data.person_id
			})
		};
		console.log(request);
		let res = await fetch('solution-explorer/leadNotes/', request);
		res = await res.json();
		console.log(res);
	}
</script>

<div class="body">
	<button type="button" on:click={addNewLead}> Purchase </button>
</div>

<style>
	button {
		background-color: var(--plblue);
		color: white;
		border: none;
		font-size: 20px;
		height: auto;
		width: 100px;
		padding: 10px 5px;
		margin: 30px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

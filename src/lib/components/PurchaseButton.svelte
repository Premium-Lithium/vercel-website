<script>
	export let queryParams;

	/**
	 * Creates new lead on pipedrive
	 */
	async function addNewLead() {
		console.log('is this thing on');

		/**
		 * body: requires person_id or organization_id (or both)
		 * 
		 * fields:
		 * Address/Post Code/Grid reference
		 * Currently have solar panels
		 * Daily energy usage
		 * New battery size
		 * Tariff Rate
		 * 
		 */
		let res = await fetch('solution-explorer/submit/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', accept: 'application/json' },
			body: JSON.stringify({
				title: 'test-lead',
				person_id: 0
			})
		});
		res = await res.json();
		// console.log(res);
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

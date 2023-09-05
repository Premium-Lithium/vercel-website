<script>
	// Authentication token: https://premiumlithium.pipedrive.com/v1/leads?api_token=f3bf98ccd22e57bbc7f2693e52e32faf89b91e44

	export let queryParams;

	/**
	 * Creates new lead on pipedrive
	 */
	async function addNewLead() {
		console.log('is this thing on');

		/**
		 * body: requires person_id or organization_id (or both)
		 */
		let res = await fetch('solution-explorer/submit/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({
				title: 'test-lead',
				owner_id: 0,
				label_ids: ['test-label'],
				person_id: 0,
				organization_id: 0,
				value: {
					amount: 4532789,
					currency: 'test'
				},
				expected_close_date: '2023-09-05',
				visible_to: '1',
				was_seen: true
			})
		});
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

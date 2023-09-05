<script>
	// Authentication token: https://premiumlithium.pipedrive.com/v1/leads?api_token=f3bf98ccd22e57bbc7f2693e52e32faf89b91e44

	export let queryParams;

	const apiToken = 'f3bf98ccd22e57bbc7f2693e52e32faf89b91e44';
	const companyDomain =
		'https://premiumlithium.pipedrive.com/v1/leads?api_token=f3bf98ccd22e57bbc7f2693e52e32faf89b91e44';

	/**
	 * Creates new lead on pipedrive
	 */
	async function addNewLead() {
		console.log('is this thing on');

		/**
		 * body: requires person_id or organization_id (or both)
		 */
		let res = await fetch(companyDomain+'/leads', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'api_token' : apiToken},
			body: JSON.stringify({
				"title": 'Deposit Test',
				"owner_id": 'Peter',
				"person_id": 'Test Person',
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

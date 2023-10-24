<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import { json } from '@sveltejs/kit';

	const dealId = $page.url.searchParams.get('selectedIds'); //dealID in payload is called selectedIds
	//const dealId = 7142;
	const userId = $page.url.searchParams.get('userId'); //userId
	const tempCode = $page.url.searchParams.get('code'); //accessToken is passed thru URL for now (not a really good idea)

	let status;
	let sdk;

	let inspectedCreated = false;
	let alertMessage = null;
	//TO DO - deploy the panel on branch deployment
	//Add authentication for users permmissions.
	const managerList = ['15970437']; // for testing purposes I'm using my userId (Nicholas Dharmadi)
	const authenticated = managerList.includes(userId);

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 315 });
	});

	onMount(() => {
		showCustomerData();
	});

	async function showCustomerData() {
		try {
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				status = responseData.message;
				console.log('Received:', responseData);
			}
		} catch (error) {
			console.log(error);
		}
	}
	async function startInspection() {
		try {
			console.log('Button 1 clicked');
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					option: 1
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				alertMessage = responseData.message;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function attachPDFToDeal() {
		try {
			console.log('Button 2 clicked');
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					option: 2
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				inspectedCreated = true; // alert that form is created
				alertMessage = responseData.message;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function updateCustomField() {
		try {
			console.log('Button 3 clicked');
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					option: 3
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				inspectedCreated = true; // alert that form is created
				alertMessage = responseData.message;
			}
		} catch (error) {
			console.log(error);
		}
	}
</script>

<div class="site-survey-panel">
	
	{#if alertMessage}
		<div class="alert-message">
			<span>{alertMessage}</span>
		</div>
	{/if}
	
	<div class="header">
		<p>Selected ID: {dealId}</p>
		<p>Status: {status}</p>
	</div>
	
	<div class="buttons-container">
		<button class="link-btn" on:click={startInspection}>Generate SafetyCulture Survey</button>
		<button class="link-btn" on:click={attachPDFToDeal}>Attach SafetyCulture PDF to Deal</button>
		<button class="link-btn" on:click={updateCustomField}>Update Custom Field</button>
	</div>

	
</div>

<style>
	.site-survey-panel {
		padding: 15px;
		border: 0px solid grey;
	}

	.header {
		display: grid;
		grid-template-columns: 50% 50%;
		& p {
			text-align: center;
		}
	}

	.alert-message {
		text-align: center;
		padding: 10px;
		background-color: #4ba6d1;
		border: 1px solid black;
	}

	.buttons-container {
		display: grid;
		grid-template-columns: auto;
	}

	.link-btn {
		background-color: #9b9b9b;
		color: black;
		text-align: center;
		padding: 10px;
		margin: 10px 0;
		border-radius: 10px;
		border: 1px solid black;
		cursor: pointer;

		&:hover {
			background-color: #5d5d5d;
		}
	}
</style>

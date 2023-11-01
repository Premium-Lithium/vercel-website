<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

	const dealId = $page.url.searchParams.get('selectedIds'); //dealID in payload is called selectedIds

	let status;
	let sdk;

	let inspectedCreated = false;
	let alertMessage = null;


	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 300 });
	});

	onMount(() => {
		if(dealId){
			showCustomerData();
		}
	});

	async function showCustomerData() {
		try {
			alertMessage = 'initializing';
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				
				if(responseData.statusCode === 200){
					status = responseData.message;
				} else {
					alertMessage = responseData.message
					await new Promise((resolve) => setTimeout(resolve, 3000));
				}
				alertMessage = null;
				console.log('Initial:', responseData);
				return response
			}
			
		} catch (error) {
			console.log(error);
			alertMessage = error;
			await new Promise((resolve) => setTimeout(resolve, 3000));
			alertMessage = null;
			return error
		}
	}
	async function startInspection() {
		try {
			if (status === undefined) {
				alertMessage = 'Generating survey';
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
					await new Promise((resolve) => setTimeout(resolve, 3000));
					showCustomerData();
					alertMessage = null;
				}
				return response
			} else {
				alertMessage = 'Error generating duplicate';
				await new Promise((resolve) => setTimeout(resolve, 3000));
				alertMessage = null;
				
			}
			
		} catch (error) {
			console.log(error);
			return error
		}
	}

	async function attachPDFToDeal() {
		try {
			alertMessage = 'Attaching PDF';
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
				await new Promise((resolve) => setTimeout(resolve, 3000));
				alertMessage = null;
			}
			return response
		} catch (error) {
			console.log(error);
			return error
		}
	}

	async function updateCustomField() {
		try {
			alertMessage = 'Updating';
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
				alertMessage = responseData.message;
				await new Promise((resolve) => setTimeout(resolve, 3000));
				alertMessage = null;
			}
			return response
		} catch (error) {
			console.log(error);
			return error
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
		<button class="link-btn" on:click={updateCustomField}>Update MPAN Field</button>
	</div>
</div>

<style>
	.site-survey-panel {
		padding: 15px;
		border: 0px solid grey;
		text-align: center;
	}

	.header {
		font-weight: bold;
		display: grid;
		grid-template-columns: 50% 50%;
		& p {
			text-align: center;
		}
	}

	.alert-message {
		text-align: center;
		padding: 2px;
		background-color: #4ba6d1;
		border: 1px solid black;
		border-radius: 10px;
	}

	.buttons-container {
		display: grid;
		grid-template-columns: auto;
	}

	.link-btn {
		background-color: #c6c6c6;
		color: black;
		text-align: center;
		padding: 10px;
		margin: 10px 0;
		border-radius: 10px;
		border: 1px solid black;
		cursor: pointer;
		font-weight: bold;
		font-size: 16px;
		&:hover {
			background-color: #9f9f9f;
		}
	}
</style>
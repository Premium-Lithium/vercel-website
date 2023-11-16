<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

	const dealId = $page.url.searchParams.get('selectedIds'); //dealID in payload is called selectedIds

	let status = undefined;
	let installationStatus = undefined;
	let sdk;

	let inspectedCreated = false;
	let alertMessage = null;
	let loading = false;

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 150 });
	});

	onMount(() => {
		if (dealId) {
			loadInspectionStatus();
		}
	});

	async function loadInspectionStatus() {
		try {
			alertMessage = 'initializing';
			loading = true;
			const response = await fetch('/site-survey-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				if (responseData.statusCode === 200) {
					status = responseData.surveyStatus;
					installationStatus = responseData.installationStatus
					alertMessage = 'synced.';
				} else {
					alertMessage = responseData.message;
				}
				await new Promise((resolve) => setTimeout(resolve, 1000));
				alertMessage = null;
			}
			loading = false;
			return response;
		} catch (error) {
			console.log(error);
			alertMessage = error;
			await new Promise((resolve) => setTimeout(resolve, 2000));
			alertMessage = null;
			return error;
		}
	}
	async function startSiteSurvey() {
		try {
			if (status === undefined | status === null) {
				alertMessage = 'Generating survey';
				loading = true;
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
					await new Promise((resolve) => setTimeout(resolve, 2000));
					loadInspectionStatus();
					alertMessage = null;
				}
				loading = false;
				return response;
			} else {
				alertMessage = 'Error generating duplicate';
				await new Promise((resolve) => setTimeout(resolve, 2000));
				alertMessage = null;
			}
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async function startInstallation() {
		try {
			if (installationStatus === undefined | installationStatus === null) {
				alertMessage = 'Generating installation';
				loading = true;
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
					alertMessage = responseData.message;
					await new Promise((resolve) => setTimeout(resolve, 2000));
					loadInspectionStatus();
					alertMessage = null;
				}
				loading = false;
				return response;
			} else {
				alertMessage = 'Error generating duplicate';
				await new Promise((resolve) => setTimeout(resolve, 2000));
				alertMessage = null;
			}
		} catch (error) {
			console.log(error);
			return error;
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
		
		
	</div>


	<div class="buttons-container">
		<p>Status: {status}</p>
		<button disabled={loading || status != undefined} class="link-btn" on:click={startSiteSurvey}
			>Generate Site Survey</button
		>
		<p>Status: {installationStatus}</p>
		<button disabled={loading || installationStatus != undefined} class="link-btn" on:click={startInstallation}
			>Generate Installation</button
		>
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
		grid-template-columns: auto auto;
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
		display: block;
	}

	.link-btn {
		background-color: #c6c6c6;
		width: 100%;
		color: black;
		text-align: center;
		padding: 10px;
		border-radius: 10px;
		border: 1px solid black;
		cursor: pointer;
		font-weight: bold;
		font-size: 16px;
		&:hover {
			background-color: #9f9f9f;
		}
		&:disabled {
			cursor: default;
			background-color: rgb(101, 101, 101);
		}
	}
</style>

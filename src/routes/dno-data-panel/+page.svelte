<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

	const dealId = $page.url.searchParams.get('selectedIds');
	const userId = $page.url.searchParams.get('userId');

	let sdk;

	let dealStatus: string = '';
	let currentSignatory: string = '';
	let alertMessage: string = '';
	let openSolarBtnDisable = true;
	let dnoApplicationBtnDisable = true;
	let contractButtonDisable = true;
	let loading = false;
	let dnoExist = false;
	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 300 });
	});

	onMount(() => {
		if (dealId) {
			searchProjectDesign();
			searchForDno();
		}
	});

	async function searchProjectDesign() {
		try {
			alertMessage = 'initializing';
			loading = true;
			const response = await fetch('/dno-data-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					userId: userId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				alertMessage = responseData.message;
				dealStatus = responseData.status;
				currentSignatory = responseData.currentSignatory;
				[openSolarBtnDisable, dnoApplicationBtnDisable, contractButtonDisable] = responseData.buttonDisable;
			}
			loading = false;
			return response;
		} catch (error) {
			console.log(error);
			alertMessage = error;
			return error;
		}
	}

	async function handleGenerate() {
		dnoApplicationBtnDisable = true;
		try {
			loading = true;
			alertMessage = 'Generating DNO';
			const response = await fetch('/dno-data-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					userId: userId,
					option: 1
				})
			});
			if (response.ok) {
				loading = false;
				const responseData = await response.json();
				alertMessage = responseData.message;
				if (responseData.statusCode === 400) dnoApplicationBtnDisable = false;
				return response;
			}
		} catch (error) {
			loading = false;
			console.log(error);
			return error;
		}
	}

	async function generateOpenSolarProject() {
		openSolarBtnDisable = true;
		try {
			alertMessage = 'Generating open solar project';
			const response = await fetch('/dno-data-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					userId: userId,
					option: 2
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				alertMessage = responseData.message;
				if (responseData.statusCode === 200) location.reload();
				return response;
			}
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async function contractBuilder() {
		try {
			alertMessage = 'Building contract documents';
			const res = await fetch('/dno-data-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					option: 3
				})
			});
			if (res.ok) {
				const resData = await res.json();
				alertMessage = resData.message;
				await new Promise((resolve) => setTimeout(resolve, 2000));
				alertMessage = '';
				return res;
			}
		} catch (error) {
			console.log(error);
			return error;
		}
	}
</script>

<div class="dno-panel">
	{#if alertMessage}
		<div class="alert-message">
			<span>{alertMessage}</span>
		</div>
	{/if}
	<div class="header">
		<p>Selected ID: {dealId}</p>
		<p>Deal Status: {dealStatus}</p>
		<p>Current Signatory: {currentSignatory ? currentSignatory : 'Not Found'}</p>
	</div>
	<button disabled={loading || openSolarBtnDisable} class="link-btn" on:click={generateOpenSolarProject}
		>Start openSolar Project</button
	>
	<button disabled={loading || dnoApplicationBtnDisable} class="link-btn" on:click={handleGenerate}
		>{(!dnoExist) ? `Generate DNO Application` : `DNO already exists for this project`}</button
	>
	<button disabled={loading || contractButtonDisable} class="link-btn" on:click={contractBuilder}
		>Build Contracts</button
	>
</div>

<style>
	.dno-panel {
		padding: 15px;
		/* border: 1px solid grey; */
		display: grid;
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
		&:disabled {
			cursor: default;
			background-color: rgb(101, 101, 101);
		}
	}

	.header {
		font-weight: bold;
	}

	.alert-message {
		text-align: center;
		padding: 2px;
		background-color: #4ba6d1;
		border: 1px solid black;
		border-radius: 10px;
	}
</style>

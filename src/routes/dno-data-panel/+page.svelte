<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

	const dealId = $page.url.searchParams.get('selectedIds');

	let sdk;

	let dealStatus: string = '';
	let currentSignatory: string = '';
	let alertMessage: string = '';
	let openSolarBtnDisable = true;
	let dnoApplicationBtnDisable = true;
	let loading = false;
	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 350 });
	});

	onMount(() => {
		if (dealId) {
			searchProjectDesign();
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
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				alertMessage = responseData.message;
				dealStatus = responseData.status;
				currentSignatory = responseData.currentSignatory;
				[openSolarBtnDisable, dnoApplicationBtnDisable] = responseData.buttonDisable;
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
			alertMessage = 'Generating DNO';
			const response = await fetch('/dno-data-panel', {
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
				if (responseData.statusCode === 400) dnoApplicationBtnDisable = false;
				return response;
			}
		} catch (error) {
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
	<button disabled={openSolarBtnDisable} class="link-btn" on:click={generateOpenSolarProject}
		>Start openSolar Project</button
	>
	<button disabled={dnoApplicationBtnDisable} class="link-btn" on:click={handleGenerate}
		>Generate DNO Application</button
	>
</div>

<style>
	.dno-panel {
		padding: 15px;
		border: 1px solid grey;
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

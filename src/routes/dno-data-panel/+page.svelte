<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

	const dealId = $page.url.searchParams.get('selectedIds');

	let data = {};

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 300 });
	});

	onMount(() => {
		showDnoData();
	});

	async function showDnoData() {
		try {
			const response = await fetch('/dno-data-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				console.log(responseData);
				data = responseData;
				return response;
			}
		} catch (error) {
			console.log(error);
			return error;
		}
	}
</script>

<div class="dno-panel">
	<div class="form">
        <p>Deal ID: {dealId}</p>
		<label for="address">Address:</label><input
			name="address"
			type="text"
			value={data.propertyAddress}
		/>
		<label for="postcode">Postcode:</label><input
			name="postcode"
			type="text"
			value={data.postCode}
		/>
	</div>

	<button>Generate DNO Application</button>
</div>

<style>
	.dno-panel {
		padding: 15px;
		border: 1px solid grey;
        display: grid;
	}
    .form {
        margin: 10px;
    }
    input {
        width: 100%;
    }
</style>

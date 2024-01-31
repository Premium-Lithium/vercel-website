<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk'

	const dealId = $page.url.searchParams.get('selectedIds')

	let message: string = ""
	let sdk: AppExtensionsSDK

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize({ size: { height: 300 } })
		if (dealId) {
			getDealDetails(dealId)
		}
	})

	async function getDealDetails(id: string) {}
</script>

<div class="panel">
	{#if message}
		<span>{message}</span>
	{/if}
	<div class="panel-body">
		<p>Deal ID: {dealId}</p>
	</div>
	
</div>

<style>
    
</style>

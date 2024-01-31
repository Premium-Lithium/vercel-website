<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk'

	const dealId = $page.url.searchParams.get('selectedIds')

	let sdk: AppExtensionsSDK

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize({ size: { height: 300 } })
		if (dealId) {
			getDealDetails(dealId)
		}
	})

	async function getDealDetails(id: string) {}
</script>

<style>
    
</style>

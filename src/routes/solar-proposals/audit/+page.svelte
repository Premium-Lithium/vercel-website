<script>
	import { PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID } from '$env/static/public'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	const urlParams = $page.url.searchParams
	let openSolarId = +(urlParams.get('id') || '0')
	let awaitingSystemResponse, awaitingImageResponse
	let systemError, imageError
	let imageUrl = ''
	let address = ''

	onMount(async () => {
		systemError = ''
		imageError = ''
		address = ''
		awaitingSystemResponse = true
		let res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-systems`, {
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			})
		})
		awaitingSystemResponse = false
		if (!res.ok) {
			systemError = res.statusText
			return
		}
		res = await res.json()
		let systemId = res.systems[0].uuid

		awaitingImageResponse = true
		res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-image`, {
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID,
				systemId
			})
		})
		awaitingImageResponse = false
		if (!res.ok) {
			imageError = res.statusText
			return
		}
		res = await res.json()
		imageUrl = res.url
	})
</script>

<div class="container">
	{#if openSolarId == 0}
		<h2>Please provide an OpenSolar ID</h2>
	{:else if awaitingSystemResponse}
		<h2>Getting OpenSolar details...</h2>
	{:else if awaitingImageResponse}
		<h2>Getting Image from OpenSolar...</h2>
	{:else if systemError != ''}
		<h2 color="red">Error: {systemError}</h2>
	{:else if imageError != ''}
		<h2 color="red">Error: {imageError}</h2>
	{:else}
		<embed src={imageUrl} width="100%" height="100%" type="application/pdf" />
	{/if}
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>

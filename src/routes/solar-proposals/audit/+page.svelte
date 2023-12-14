<script>
	import { PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID } from '$env/static/public'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	const urlParams = $page.url.searchParams
	let openSolarId = +(urlParams.get('id') || '0')
	let awaitingSystemResponse, awaitingImageResponse
	let imageUrl = ''
	let address = ''

	onMount(async () => {
		awaitingSystemResponse = true
		let res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-systems`, {
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID
			})
		})
		res = await res.json()
		let systemId = res.systems[0].uuid
		awaitingSystemResponse = false
		awaitingImageResponse = true
		res = await fetch(`${$page.url.origin}/solar-proposals/open-solar/get-image`, {
			method: 'POST',
			body: JSON.stringify({
				openSolarId,
				'openSolarOrgId': PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_ORG_ID,
				systemId
			})
		})
		res = await res.json()
		imageUrl = res.url

		awaitingImageResponse = false
	})
</script>

<div class="container">
	{#if awaitingSystemResponse}
		<h2>Getting OpenSolar details...</h2>
	{:else if awaitingImageResponse}
		<h2>Getting Image from OpenSolar...</h2>
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

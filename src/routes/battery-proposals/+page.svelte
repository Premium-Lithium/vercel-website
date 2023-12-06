<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import Auth from '$lib/components/Auth.svelte'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { supabase } from '$lib/supabase'
	import type { Loader } from '@googlemaps/js-api-loader'
	import type { UUID } from 'crypto'
	import { onMount } from 'svelte'
	import { generateUUID } from 'three/src/math/MathUtils'
	import { default as template } from './Template.kml'

	let supabaseAuth: Object
	let activeArea: Array<any> | undefined = undefined
	let map: google.maps.Map, loader: Loader
	let drawingManager
	let loadingDrawingManager: boolean = false
	let drawnRegions: boolean = false

	let campaign: string = ''
	const urlParams = $page.url.searchParams
	campaign = urlParams.get('campaign-id') || ''
	let campaignAreas: Array<any>
	let uniqueIdentifier: UUID
	let loadedWorkerDetails: boolean = false

	onMount(async () => {
		supabase
			.channel('room1')
			.on('broadcast', { event: 'claim_project' }, async (payload) => {
				console.log(payload)
				console.log('test')
				campaignAreas = await loadCampaignAreas(campaign)
			})
			.subscribe()
		campaignAreas = await loadCampaignAreas(campaign)
	})

	$: if (supabaseAuth) {
		uniqueIdentifier = supabaseAuth.user.id
		loadWorkerDetails().then(() => {
			loadedWorkerDetails = true
		})
	}

	async function loadWorkerDetails() {
		const { data: workerData, error: workerError } = await supabase
			.from('battery_turk_workers')
			.select('*')
			.eq('worker_id', uniqueIdentifier)

		if (workerData.length == 0) {
			const { data: insertWorkerData, error: insertWorkerError } = await supabase
				.from('battery_turk_workers')
				.insert({ 'worker_id': uniqueIdentifier })
		} else {
			if (workerData[0]['assigned_region']) {
				activeArea = workerData[0]['assigned_region'].area
			}
		}
	}

	async function loadCampaignAreas(campaignId: string) {
		const { data: campaignData, error: campaignGetError } = await supabase
			.from('campaign_master')
			.select('*')
			.eq('campaign_id', campaignId)
		return campaignData[0].area
			.filter((x) => {
				return x.status == 'unprocessed'
			})
			.sort((a, b) => b.estNumProperties - a.estNumProperties)
	}

	async function completeRegion() {
		let { data: selectData, error: selectError } = await supabase
			.from('battery_turk_workers')
			.select('assigned_region')
			.eq('worker_id', uniqueIdentifier)

		let regionToUpload = { ...selectData[0], 'time_finished': new Date(Date.now()).toISOString() }
		const { data: uploadData, error: uploadError } = await supabase
			.from('battery_turk_workers')
			.update({ 'assigned_region': null, 'completed_regions': [regionToUpload] })
			.eq('worker_id', uniqueIdentifier)

		console.log('Worker table updated', uploadData, uploadError)

		const { data: masterSelectData, error: masterSelectError } = await supabase
			.from('campaign_master')
			.select('area')
			.eq('campaign_id', campaign)

		let masterDataToUpload = masterSelectData[0].area.map((x) => {
			if (JSON.stringify(x.area) == JSON.stringify(selectData[0]['assigned_region'].area)) {
				x.status = 'processed'
			}
			return x
		})
		console.log(masterDataToUpload)

		const { data: masterUploadData, error: masterUploadError } = await supabase
			.from('campaign_master')
			.update({ 'area': masterDataToUpload })
			.eq('campaign_id', campaign)
		console.log('Master table updated', masterUploadData, masterUploadError)
		activeArea = null
		supabase.channel('room1').send({
			type: 'broadcast',
			event: 'claim_project',
			payload: { message: 'claimed this project' }
		})
	}

	async function saveKml(region) {
		let res = await fetch(template)
		let kml = await res.text()
		let uuid = generateUUID().split('-').at(-1)
		kml = kml
			.replace(
				'COORDINATE-LIST',
				region
					.map((i) => {
						return `${i[0]},${i[1]},0`
					})
					.join(' ')
			)
			.replace('ID-X', uuid)
			.replace('NAME-X', `${uuid}`)
			.replace('Template', `${campaign}`)

		const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' })

		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `region-${uuid}.kml`
		document.body.appendChild(a)
		a.click()

		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	async function allocateNewRegion() {
		campaignAreas = await loadCampaignAreas(campaign)
		const { data: insertData, error: insertError } = await supabase
			.from('battery_turk_workers')
			.update({
				'assigned_region': {
					area: campaignAreas[0].area,
					'time_started': new Date(Date.now()).toISOString()
				}
			})
			.eq('worker_id', uniqueIdentifier)
		activeArea = campaignAreas[0].area
	}
</script>

{#if browser}
	{#if !supabaseAuth}
		<Auth redirectUrl="battery-proposals" bind:supabaseAuth />
	{:else if !loadedWorkerDetails}
		<p>Loading...</p>
	{:else}
		<div class="container">
			{#if activeArea}
				<div class="button-container">
					<button
						class="download-button"
						on:click={() => {
							saveKml(activeArea)
						}}>Download KML</button
					>
					<button class="complete-region-button" on:click={completeRegion}>Complete Area</button>
				</div>
			{:else}
				<h3>No region currently selected</h3>
				<div class="button-container">
					<button class="select-region-button" on:click={allocateNewRegion}>Get a new region</button
					>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		background-color: #f2f2f2;
		width: 100%;
		min-height: 100%;
		height: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.button-container {
		height: fit-content;
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.button-container button {
		background-color: #eaeaea;
		border-radius: 8px;
		color: black;

		cursor: pointer;
		transition: background-color 0.3s ease;
		padding: 10px 20px;
		border: 2px solid #35bbed;
	}

	.button-container button:hover {
		background-color: #dadada;
	}

	.button-container button:active {
		background-color: darken(#eaeaea, 20%);
	}

	.button-container button.disabled {
		background-color: #ccc;
	}

	.button-container button.negative {
		background-color: #e74c3c;
	}
</style>

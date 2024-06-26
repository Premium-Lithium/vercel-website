<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import Auth from '$lib/components/Auth.svelte'
	import { supabase } from '$lib/supabase'
	import type { UUID } from 'crypto'
	import { onMount } from 'svelte'
	import { default as template } from './Template.kml'
	import type { RealtimeChannel } from '@supabase/supabase-js'

	let supabaseAuth: Object
	let activeArea: Array<any> | undefined = undefined
	let activeCampaign: string | undefined = undefined

	let activeCampaigns: Array<string> = []
	let campaignAreas: Array<any> = []
	let uniqueIdentifier: UUID
	let loadedWorkerDetails: boolean = false
	let broadcastRoom: RealtimeChannel
	let numRegionsCompleted: number = 0
	let kmlFileInput
	let uploadedFile: File
	let uploadedFilesFromFileInput: FileList
	let result
	let dateFinished

	onMount(async () => {
		campaignAreas = await loadCampaignAreas()
	})
	$: if (supabaseAuth) {
		uniqueIdentifier = supabaseAuth.user.id
		broadcastRoom = supabase.channel('room1')
		broadcastRoom
			.on('broadcast', { event: 'claim_project' }, async (payload) => {
				campaignAreas = await loadCampaignAreas()
			})
			.subscribe()
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
				.insert({ 'worker_id': uniqueIdentifier, 'worker_email': supabaseAuth.user.email })
		} else {
			if (workerData[0]['assigned_region']) {
				activeArea = workerData[0]['assigned_region'].area
				activeCampaign = workerData[0]['assigned_region']['campaign_id']
			}
			numRegionsCompleted = workerData[0]['completed_regions']?.length ?? 0
		}
	}

	async function loadCampaignArea(campaignId: string) {
		const { data: campaignData, error: campaignGetError } = await supabase
			.from('campaign_master')
			.select('*')
			.eq('campaign_id', campaignId)
		if (!campaignData[0]) return
		return campaignData[0].area
			.filter((x) => {
				return x.status == 'unprocessed'
			})
			.sort((a, b) => b.estNumProperties - a.estNumProperties)
			.map((x) => {
				return { campaignId, 'area': x }
			})
	}

	async function loadCampaignAreas() {
		const { data: getActiveCampaignData, error: getActiveCampaignError } = await supabase
			.from('campaign_master')
			.select('*')
		activeCampaigns = getActiveCampaignData
			?.map((x) => {
				if (x['campaign_name'].includes('existing-solar')) return x.campaign_id
			})
			.filter((x) => {
				return x
			})

		let promises: Array<Promise<Array<any>>> = []
		activeCampaigns.forEach((x) => {
			promises.push(loadCampaignArea(x))
		})
		return (await Promise.all(promises))[0]
	}

	async function completeRegion() {
		let { data: selectData, error: selectError } = await supabase
			.from('battery_turk_workers')
			.select('*')
			.eq('worker_id', uniqueIdentifier)
		let fileName = ''
		if (uploadedFile) {
			fileName = await uploadFile(uploadedFile, activeCampaign)
			if (!fileName) return
		}

		let regionToUpload = {
			'time_finished': dateFinished,
			'num_polygons': result.polygons.length - 1,
			...selectData[0]['assigned_region']
		}

		console.log(regionToUpload)
		numRegionsCompleted = (selectData[0]['completed_regions']?.length ?? 0) + 1
		const { data: uploadData, error: uploadError } = await supabase
			.from('battery_turk_workers')
			.update({
				'assigned_region': null,
				'completed_regions': [...(selectData[0]['completed_regions'] ?? []), regionToUpload]
			})
			.eq('worker_id', uniqueIdentifier)

		const { data: masterSelectData, error: masterSelectError } = await supabase
			.from('campaign_master')
			.select('area')
			.eq('campaign_id', activeCampaign)

		let masterDataToUpload = masterSelectData[0].area.map((x) => {
			if (JSON.stringify(x.area) == JSON.stringify(selectData[0]['assigned_region'].area)) {
				x.status = 'processed'
			}
			return x
		})
		const { data: masterUploadData, error: masterUploadError } = await supabase
			.from('campaign_master')
			.update({ 'area': masterDataToUpload })
			.eq('campaign_id', selectData[0]['campaign_id'])
		activeArea = null
		activeCampaign = null
		broadcastRoom.send({
			type: 'broadcast',
			event: 'claim_project',
			payload: { message: 'claimed this project' }
		})
		uploadedFile = undefined
		uploadedFilesFromFileInput = undefined
	}

	async function saveKml(region, campaign) {
		let res = await fetch(template)
		let kml = await res.text()
		let uuid = `${uniqueIdentifier.split('-')[0]}-region-${numRegionsCompleted}`
		console.log(region, campaign)
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
		a.download = `${uniqueIdentifier.split('-')[0]}-${new Date(Date.now()).toISOString()}.kml`
		document.body.appendChild(a)
		a.click()

		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	async function allocateNewRegion() {
		campaignAreas = await loadCampaignAreas()
		const { data: insertData, error: insertError } = await supabase
			.from('battery_turk_workers')
			.update({
				'assigned_region': {
					area: campaignAreas[0].area.area,
					'time_started': new Date(Date.now()).toISOString(),
					'campaign_id': campaignAreas[0].campaignId
				}
			})
			.eq('worker_id', uniqueIdentifier)

		const { data: masterSelectData, error: masterSelectError } = await supabase
			.from('campaign_master')
			.select('area')
			.eq('campaign_id', campaignAreas[0].campaignId)

		let masterDataToUpload = masterSelectData[0].area.map((x) => {
			if (JSON.stringify(x.area) == JSON.stringify(campaignAreas[0].area.area)) {
				x.status = 'allocated'
			}
			return x
		})
		const { data: masterUploadData, error: masterUploadError } = await supabase
			.from('campaign_master')
			.update({ 'area': masterDataToUpload })
			.eq('campaign_id', campaignAreas[0].campaignId)
		activeArea = campaignAreas[0].area
		activeCampaign = campaignAreas[0].campaignId
		await saveKml(campaignAreas[0].area.area, campaignAreas[0].campaignId)
	}

	async function uploadFile(file, campaign) {
		console.log(file)
		let successful = false
		dateFinished = new Date(Date.now()).toISOString()
		try {
			const { data, error } = await supabase.storage
				.from('worker-kml-upload')
				.upload(`${campaign}/${uniqueIdentifier}/${dateFinished}`, file, {
					upsert: true
				})
			successful = !error
			console.log(error)
		} catch (error) {
			console.error('Error uploading file:', error.message)
		}
		return `${campaign}/${uniqueIdentifier}/${dateFinished}`
	}

	function handleDragOver(event) {
		event.preventDefault()
		event.currentTarget.classList.add('drag-over')
	}

	function handleDragEnter(event) {
		event.preventDefault()
	}

	function handleDragLeave(event) {
		event.currentTarget.classList.remove('drag-over')
	}

	async function handleDrop(event) {
		uploadedFile = undefined
		event.preventDefault()
		event.currentTarget?.classList.remove('drag-over')
		const files = event.dataTransfer.files
		if (files.length > 0 && files[0].name.endsWith('.kml')) {
			kmlFileInput.files = files
			uploadedFile = files[0]
			await parseDocument(uploadedFile)
		}
	}

	async function handleUpload(event) {
		uploadedFile = undefined
		const files = event.srcElement.files
		if (files.length > 0 && files[0].name.endsWith('.kml')) {
			uploadedFile = files[0]
		}
	}

	async function parseDocument(file) {
		let fileReader = new FileReader()
		fileReader.onload = async (e) => {
			result = await extractGoogleCoords(e.target.result)
		}
		fileReader.readAsText(file)
	}

	async function extractGoogleCoords(plainText) {
		let parser = new DOMParser()
		let xmlDoc = parser.parseFromString(plainText, 'text/xml')
		let googlePolygons = []
		let googleMarkers = []

		if (xmlDoc.documentElement.nodeName == 'kml') {
			for (const item of xmlDoc.getElementsByTagName('Placemark')) {
				let placeMarkName = item.getElementsByTagName('name')[0].childNodes[0].nodeValue.trim()
				let polygons = item.getElementsByTagName('Polygon')
				let markers = item.getElementsByTagName('Point')

				/** POLYGONS PARSE **/
				for (const polygon of polygons) {
					let coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
					let points = coords.split(' ')

					let googlePolygonsPaths = []
					for (const point of points) {
						let coord = point.split(',')
						googlePolygonsPaths.push({ lat: +coord[1], lon: +coord[0] }) // +x converts x from string to a number
					}
					googlePolygons.push(googlePolygonsPaths)
				}

				/** MARKER PARSE **/
				for (const marker of markers) {
					var coords = marker.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
					let coord = coords.split(',')
					googleMarkers.push({ lat: +coord[1], lon: +coord[0] })
				}
			}
		} else {
			throw 'error while parsing'
		}

		return { markers: googleMarkers, polygons: googlePolygons }
	}
</script>

{#if browser}
	{#if !supabaseAuth}
		<Auth redirectUrl={`battery-proposals`} bind:supabaseAuth />
	{:else if !loadedWorkerDetails}
		<p>Loading...</p>
	{:else}
		<div class="container">
			{#if activeArea}
				<div class="button-container">
					<button
						class="download-button"
						on:click={() => {
							saveKml(activeArea, activeCampaign)
						}}>Download KML</button
					>
					<button
						class="complete-region-button"
						class:disabled={!uploadedFile ? true : false}
						on:click={completeRegion}>Complete Area</button
					>
					<div
						class="drop-zone"
						on:drop={handleDrop}
						on:dragover={handleDragOver}
						on:dragenter={handleDragEnter}
						on:dragleave={handleDragLeave}
					>
						{#if uploadedFile}
							<p>Uploaded: {uploadedFile.name}</p>
						{:else}
							<p>Drag and drop a file here, or click to select a file</p>
						{/if}
						<input
							type="file"
							id="fileInput"
							accept=".kml"
							style="width: 100%; height: 100%;"
							bind:files={uploadedFilesFromFileInput}
							on:change={handleUpload}
							bind:this={kmlFileInput}
						/>
					</div>
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

	.drop-zone {
		border: 2px dashed #ccc;
		border-radius: 10px;
		padding: 20px;
		text-align: center;
		cursor: pointer;
		user-select: none;
	}

	.drop-zone.drag-over {
		border-color: #000;
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
		user-select: none;

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
		border: 2px solid #ccc;
		pointer-events: none;
	}

	.button-container button.negative {
		background-color: #e74c3c;
	}
</style>

<script>
	import { supabase } from '$lib/supabase'
	import { page } from '$app/stores'
	import AzimuthPitchDisplay from './AzimuthPitchDisplay.svelte'
	import { onMount } from 'svelte'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	let googleSolarResponse = undefined
	let roofSection = undefined
	let confident = false
	let errorMessage = ''
	let awaitingResponse = false
	let buildingLat, buildingLon, roofLat, roofLon, map, loader, drawingManager
	let loadingDrawingManager = false
	let loadingSpherical = false
	let allAuditedProperties = undefined

	const urlParams = $page.url.searchParams
	buildingLat = urlParams.get('blat') || ''
	buildingLon = urlParams.get('blon') || ''
	roofLat = urlParams.get('rlat') || ''
	roofLon = urlParams.get('rlon') || ''
	let googleEarthLink = undefined

	onMount(async () => {
		let { data, error } = await supabase.from('existing-solar-properties').select('*')
		allAuditedProperties = data.filter((x) => {
			return x['audit_flags'].length == 1 && x['audit_flags'].includes(99)
		})
	})

	$: if (loader) {
		if (!loadingDrawingManager && !drawingManager) {
			loadingDrawingManager = true
			loader.importLibrary('drawing').then(async (d) => {
				drawingManager = new d.DrawingManager()
				drawingManager.setOptions({
					rectangleOptions: {
						fillOpacity: 0.4,
						fillColor: '#fff',
						strokeColor: '#35bbed',
						clickable: true
					},
					drawingControlOptions: { drawingModes: [] }
				})
				drawingManager.setMap(map)
				loadingDrawingManager = false
			})
		}
	}
	async function handleSubmit(event) {
		awaitingResponse = true
		errorMessage = ''
		const formData = new FormData(event.target)
		const rlat = formData.get('rlat')
		const rlon = formData.get('rlon')
		const blat = formData.get('blat')
		const blon = formData.get('blon')
		map.panTo(new google.maps.LatLng(rlat, rlon))

		let res = await fetch(`/battery-proposals/estimate-heading-of-panel`, {
			method: 'POST',
			body: JSON.stringify({
				'roofCoords': { 'lat': rlat, 'lon': rlon },
				'buildingCoords': { 'lat': blat, 'lon': blon }
			})
		})
		if (!res.ok) {
		} else {
			googleSolarResponse = await res.json()
			let bboxContainPoints = googleSolarResponse.boundingBoxesContainingPoint.map((bbox) => {
				return (
					bbox.center.latitude == googleSolarResponse.closestCenter.center.latitude &&
					bbox.center.longitude == googleSolarResponse.closestCenter.center.longitude
				)
			})
			if (bboxContainPoints.includes(true)) {
				confident = true
				roofSection = googleSolarResponse.closestCenter
			} else if (googleSolarResponse.boundingBoxesContainingPoint.length == 1) {
				confident = true
				roofSection = googleSolarResponse.boundingBoxesContainingPoint[0]
			} else {
				confident = false
				errorMessage = 'Cannot confidently find roof section'
				roofSection = googleSolarResponse.closestCenter
			}
			console.log(roofSection)
		}
		map.moveCamera({
			center: new google.maps.LatLng(roofSection.center.latitude, roofSection.center.longitude),
			zoom: 21
		})
	}

	async function getRandomSupabaseBuilding() {
		const building = allAuditedProperties.sort(() => {
			return Math.random() > 0.5 ? 1 : -1
		})[0]
		buildingLat = building.address.geometry.location.lat
		buildingLon = building.address.geometry.location.lng
		roofLat = building['solar_array_info'][0].location.latitude
		roofLon = building['solar_array_info'][0].location.longitude
		googleEarthLink = building['google_earth_url']
	}
</script>

<div class="container">
	<div class="header">
		<button class="random-building-button" on:click={getRandomSupabaseBuilding}
			>Get random building</button
		>
		{#if googleEarthLink}
			<a href={googleEarthLink} target="_blank">Google Earth link</a>
		{/if}
	</div>
	<p />
	<form on:submit={handleSubmit}>
		<label for="blat">Building Latitude:</label>
		<input type="number" step="any" id="blat" name="blat" bind:value={buildingLat} required />

		<label for="blon">Building Longitude:</label>
		<input type="number" step="any" id="blon" name="blon" bind:value={buildingLon} required />

		<label for="rlat">Roof Section Latitude:</label>
		<input type="number" step="any" id="rlat" name="rlat" bind:value={roofLat} required />

		<label for="rlon">Roof Section Longitude:</label>
		<input type="number" step="any" id="rlon" name="rlon" bind:value={roofLon} required />

		<button type="submit">Get roof details</button>
	</form>
	<p style="color: red;">{errorMessage}</p>

	{#if roofSection}
		<p>Azimuth: {roofSection.azimuthDegrees}</p>
		<p>Pitch: {roofSection.pitchDegrees}</p>
		<p>Area: {roofSection.stats.areaMeters2}</p>
		<!-- <div class="azimuth-pitch-display">
			<AzimuthPitchDisplay
				bind:azimuth={roofSection.azimuthDegrees}
				bind:pitch={roofSection.pitchDegrees}
			/>
		</div> -->
	{/if}
	<GoogleMap bind:map bind:loader minZoom={10} initialZoom={13} />
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.container > a {
		width: fit-content;
	}
	form {
		max-width: 300px;
		margin: 2rem auto;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #f9f9f9;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	label {
		display: block;
		color: #333;
	}

	input[type='number'] {
		width: 100%;
		border: 1px solid #ccc;
		margin-bottom: 4px;
		border-radius: 4px;
		font-size: 24px;
	}

	button {
		width: 100%;
		padding: 0.5rem;
		border: none;
		border-radius: 4px;
		background-color: #5cb85c;
		color: white;
		cursor: pointer;
		font-size: 1rem;
	}

	button:hover {
		background-color: #4cae4c;
	}

	.azimuth-pitch-display {
		width: 100%;
	}

	.header {
		margin: 12px;
		width: 50%;
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 6px;
	}
</style>

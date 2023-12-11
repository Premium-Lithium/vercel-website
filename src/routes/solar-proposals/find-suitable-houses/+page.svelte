<script>
	import { getRandomColor } from '$lib/utils'
	import { page } from '$app/stores'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	let awaitingResponse = false
	let errorMessage = ''

	let left,
		right,
		bottom,
		top,
		map,
		loader,
		drawingManager,
		spherical,
		submitButton,
		selectedCampaignId

	const urlParams = $page.url.searchParams
	left = urlParams.get('left') || ''
	bottom = urlParams.get('bottom') || ''
	right = urlParams.get('right') || ''
	top = urlParams.get('top') || ''

	let southFacing = false
	let minimumRoofSize = 16
	let southFacingThreshold = 15
	let loadingDrawingManager = false
	let loadingSpherical = false
	let polygons = []

	let isAuthenticated = false
	let doGeocoding = true
	let doGoogleSolar = true
	let downloadAsCsv = false
	let status = ''

	let selectedFile
	let googleMapsPolygon

	let possibleCampaigns = []

	onMount(async () => {
		const { data, error } = await supabase.from('campaign_master').select('*')
		possibleCampaigns = data
	})

	function handleFileChange(event) {
		selectedFile = event.target.files[0]
		if (selectedFile) {
			const reader = new FileReader()
			reader.onload = (e) => {
				const fileContents = e.target.result
				drawPolygon(fileContents)
				submitButton.click()
			}
			reader.readAsText(selectedFile)
		}
	}

	function drawPolygon(kmlData) {
		googleMapsPolygon?.setMap(null)
		let coordinates = parseKMLToCoordinates(kmlData)

		googleMapsPolygon = new google.maps.Polygon({
			paths: coordinates,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0.4,
			fillColor: '#fff',
			strokeColor: '#35bbed',
			map
		})
		let southWest = getPolygonBounds(googleMapsPolygon).getSouthWest()
		let northEast = getPolygonBounds(googleMapsPolygon).getNorthEast()
		left = southWest.lng()
		bottom = southWest.lat()
		right = northEast.lng()
		top = northEast.lat()
		map.fitBounds(getPolygonBounds(googleMapsPolygon))
	}

	function parseKMLToCoordinates(kmlData) {
		const parser = new DOMParser()
		const xmlDoc = parser.parseFromString(kmlData, 'application/xml')
		const coordinateElements = xmlDoc.getElementsByTagName('coordinates')
		if (coordinateElements.length > 0) {
			const coordinates = coordinateElements[0].textContent.trim().split(/\s+/)
			return coordinates.map((coord) => {
				const [lng, lat] = coord.split(',').map(Number)
				return { lat, lng }
			})
		}
		return []
	}

	function getPolygonBounds(polygon) {
		let left = undefined
		let bottom = undefined
		let top = undefined
		let right = undefined
		polygon
			.getPaths()
			.getArray()[0]
			.forEach((x) => {
				if (!bottom || x.lat() < bottom) bottom = x.lat()
				if (!top || x.lat() > top) top = x.lat()
				if (!left || x.lng() < left) left = x.lng()
				if (!right || x.lng() > right) right = x.lng()
			})
		return new google.maps.LatLngBounds(
			new google.maps.LatLng(bottom, left),
			new google.maps.LatLng(top, right)
		)
	}

	$: if (loader) {
		if (!loadingDrawingManager && !drawingManager) {
			loadingDrawingManager = true

			loader.importLibrary('drawing').then(async (d) => {
				drawingManager = new d.DrawingManager()
				drawingManager.setOptions({
					rectangleOptions: {
						editable: true,
						fillOpacity: 0.4,
						fillColor: '#fff',
						strokeColor: '#35bbed',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						draggable: true
					},
					drawingControlOptions: { drawingModes: [google.maps.drawing.OverlayType.RECTANGLE] }
				})
				drawingManager.setMap(map)
				drawingManager.addListener('rectanglecomplete', (rect) => {
					drawingManager.setDrawingMode(null)
					let southWest = rect.bounds.getSouthWest()
					let northEast = rect.bounds.getNorthEast()
					left = southWest.lng()
					bottom = southWest.lat()
					right = northEast.lng()
					top = northEast.lat()
					rect.addListener('bounds_changed', () => {
						let southWest = rect.bounds.getSouthWest()
						let northEast = rect.bounds.getNorthEast()
						left = southWest.lng()
						bottom = southWest.lat()
						right = northEast.lng()
						top = northEast.lat()
					})
				})
				loadingDrawingManager = false
			})
		}
		if (!loadingSpherical && !spherical) {
			loadingSpherical = true
			loader.importLibrary('geometry').then(async (g) => {
				spherical = g.spherical
			})
			loadingSpherical = false
		}
	}
	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
	})

	async function getStreets() {
		awaitingResponse = true
		status = 'Getting OSM data...'
		errorMessage = ''
		let allElements = []
		let promises = []
		const formData = new FormData(event.target)
		let left = formData.get('left')
		let bottom = formData.get('bottom')
		let right = formData.get('right')
		let top = formData.get('top')

		let grid = breakDownIntoGrid(left, bottom, top, right, 250000)

		grid.forEach((x, i, a) => {
			x.forEach((xy, j) => {
				left = xy.getSouthWest().lng()
				bottom = xy.getSouthWest().lat()
				right = xy.getNorthEast().lng()
				top = xy.getNorthEast().lat()
				promises.push(
					fetch(`${$page.url.origin}/solar-proposals/find-suitable-houses`, {
						method: 'POST',
						body: JSON.stringify({
							left: parseFloat(left.toString()),
							bottom: parseFloat(bottom.toString()),
							right: parseFloat(right.toString()),
							top: parseFloat(top.toString())
						}),
						headers: { 'Content-Type': 'application/json' }
					})
						.then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
						.catch((error) => {
							console.error('Fetch error:', error)
							return []
						})
				)
			})
		})

		await Promise.all(promises).then((responses) => {
			allElements = responses.reduce((p, v) => {
				return p.concat(v.elements || [])
			}, [])
		})
		console.log('total num of ways/nodes/relations')
		console.log(allElements.length)
		status = 'Finding streets...'
		let streetWays = allElements.filter((x) => {
			return x.type == 'way' && x.tags?.highway == 'residential'
		})
		let streetNodes = getNodesFromWays(streetWays, allElements)
		console.log(streetNodes)
		let streetNames = getStreetNames(streetNodes)
		console.log(streetNames)
		let streetsWithHouses = []

		if (doGeocoding) {
			status = 'Performing Geocoding...'
			let geocodesOfAddress = await findAddressesOnStreets(streetNames, streetNodes)
			let allParsedData = geocodesOfAddress.reduce((p, v, i, a) => {
				return p.concat(parseResponseData(v.houses))
			}, [])
			if (downloadAsCsv) downloadCSV(allParsedData, `York-houses.csv`)
			streetsWithHouses = geocodesOfAddress
		}
		let googleSolarResults = []
		let suitableHouses = streetsWithHouses.reduce((p, v, i, a) => {
			return Array.from(new Set(p.concat(v.houses)))
		}, [])

		if (doGoogleSolar) {
			let promises = []

			streetsWithHouses.forEach((street) => {
				console.log(street)
				street.houses.forEach((house) => {
					const lat = house.geometry.location.lat
					const lon = house.geometry.location.lng

					promises.push(
						new Promise((resolve) =>
							setTimeout(async () => {
								try {
									let response = await fetch(`${$page.url.origin}/solar-proposals/google-solar`, {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({ lat, lon, quality: 'MEDIUM' })
									})
									let data = await response.json()
									resolve({ solarResult: data, house: house })
								} catch (error) {
									console.error('Error with fetch for house:', house, error)
									resolve(null)
								}
							}, promises.length * 201)
						)
					)
				})
			})

			try {
				googleSolarResults = await Promise.all(promises)
				googleSolarResults = googleSolarResults.filter((x) => x)
			} catch (error) {
				console.error('An error occurred with the batch of promises', error)
			}

			console.log(googleSolarResults)

			suitableHouses = []

			let housesWithASouthernRoof = googleSolarResults.filter((x) => {
				if (x.solarResult.error) return false
				return getSoutherlyRoofSections(x.solarResult.solarPotential.roofSegmentStats).length
			})

			suitableHouses = housesWithASouthernRoof.filter((x) => {
				return doesRoofHaveEnoughSpaceFor6Panels(
					getSoutherlyRoofSections(x.solarResult.solarPotential.roofSegmentStats)
				)
			})
		}

		console.log('Suitable houses:')
		console.log(suitableHouses)

		suitableHouses.forEach(async (x) => {
			let { buildingStats, roofSegmentStats, wholeRoofStats, maxArrayAreaMeters2 } =
				x.solarResult.solarPotential
			let { data, error } = await supabase.from('campaign_customers').upsert({
				campaign_id: selectedCampaignId,
				campaign_specific_data: {
					'roof_details': { buildingStats, maxArrayAreaMeters2, roofSegmentStats, wholeRoofStats }
				},
				address: x.house,
				address_formatted: x.house['formatted_address'],
				current_status: {
					name: 'PRE-DESIGN',
					description: 'Not yet had an OpenSolar Design created',
					date_started: new Date(Date.now()).toISOString()
				}
			})
		})
		awaitingResponse = false
	}

	async function findAddressesOnStreets(streetNames, streetNodes) {
		let addresses = await Promise.all(
			streetNames.map(async (streetName, i) => {
				let houses = []
				let strikes = 0
				let limit = 1
				let hardLimit = 50
				let limitFound = false
				let res = await fetch(`${$page.url.origin}/solar-proposals/geocoding`, {
					method: 'POST',
					body: JSON.stringify({
						lat: streetNodes[i].nodes[0].lat,
						lon: streetNodes[i].nodes[0].lon
					})
				})
				let addressComponents = (await res.json()).results[0]['address_components']
				let addressArea = addressComponents
					.filter((x) => {
						return ['postal_town', 'administrative_area_level_2', 'country'].includes(x.types[0])
					})
					.map((x) => {
						return x['long_name']
					})
					.join(', ')

				while (!limitFound && limit <= hardLimit && strikes < 3) {
					let res = await fetch(`${$page.url.origin}/solar-proposals/geocoding`, {
						method: 'POST',
						body: JSON.stringify({ address: `${limit} ${streetName}, ${addressArea}` })
					})
					if (!res.ok) {
						console.log(res.statusText)
						break
					}
					res = await res.json()
					if (!isLatLonInBounds(res.results[0].geometry.location, { left, top, right, bottom })) {
						strikes += 1
						continue
					}

					if (res.results[0].geometry['location_type'] == 'RANGE_INTERPOLATED') {
						strikes += 1
						continue
					}
					let numberInResponse = res.results[0]['address_components'].filter((x) =>
						x.types.includes('street_number')
					)
					if (numberInResponse.length > 0) {
						houses.push(res.results[0])
						limit++
					} else {
						limitFound = true
					}
				}
				return { streetName, houses }
			})
		)
		return addresses
	}

	function isLatLonInBounds(latLon, bounds) {
		return (
			latLon.lat > bounds.bottom &&
			latLon.lat < bounds.top &&
			latLon.lng > bounds.left &&
			latLon.lng < bounds.right
		)
	}

	function parseResponseData(houses) {
		let response = houses.map((house) => {
			const formattedAddress = house['formatted_address']
			const address = JSON.stringify(house['address_components'])
			const latitude = house.geometry.location.lat
			const longitude = house.geometry.location.lng
			return [address, formattedAddress, latitude, longitude]
		})
		return response
	}

	function downloadCSV(array, filename) {
		const csvContent = array
			.map((row) => row.map((field) => `"${field.toString().replace(/"/g, '""')}"`).join(','))
			.join('\n')
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute('download', filename)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	function getLeftmost(arr) {
		return arr.reduce((p, c, i, a) => {
			return p.lon < c.lon ? p : c
		})
	}

	function getRightmost(arr) {
		return arr.reduce((p, c, i, a) => {
			return p.lon > c.lon ? p : c
		})
	}

	function getHousesWithDetails(elements) {
		return elements.filter((x) => {
			return x.type == 'way' && x.tags?.building == 'house'
		})
	}

	function getHouseNames(elements) {
		return elements.map(async (x) => {
			return (await geocodeLatLngs([x]))[0].geocode.results[0]
		})
	}

	function getEastToWestStreets(elements) {
		let eastToWestStreets = []
		elements.forEach((street) => {
			let leftMost = getLeftmost(street.nodes)
			let rightMost = getRightmost(street.nodes)
			let diff = Math.abs(Math.abs(leftMost.lon) - Math.abs(rightMost.lon))
			if (Math.abs(Math.abs(leftMost.lat) - Math.abs(rightMost.lat)) < diff / 100)
				eastToWestStreets.push(street)
		})
		return eastToWestStreets
	}

	function getNodesFromWays(ways, elements) {
		let wayNodes = []
		ways.forEach((way) => {
			let nodes = []
			way.nodes.forEach((node) => {
				nodes.push(
					elements.filter((x) => {
						return x.id == node
					})[0]
				)
			})
			wayNodes.push({ way, nodes })
		})
		return wayNodes
	}

	function getStreetNames(streets) {
		let streetNames = streets.map((x) => x.way.tags?.name)
		let streetAltNames = streets.map((x) => x.way.tags['alt_name']).filter((x) => x)
		return Array.from(new Set(streetNames.concat(...streetAltNames))).filter((x) => {
			return x
		})
	}

	function getMeanLatLon(nodes) {
		let meanLat =
			nodes.reduce((p, c, i, a) => {
				return p + c.lat
			}, 0) / nodes.length
		let meanLon =
			nodes.reduce((p, c, i, a) => {
				return p + c.lon
			}, 0) / nodes.length
		return { lat: meanLat, lon: meanLon }
	}

	function getSoutherlyRoofSections(roofSegmentStats) {
		if (!southFacing) return roofSegmentStats
		return roofSegmentStats.filter((segment) => {
			return (
				segment.azimuthDegrees >= 180 - southFacingThreshold &&
				segment.azimuthDegrees <= 180 + southFacingThreshold
			)
		})
	}

	function doesRoofHaveEnoughSpaceFor6Panels(roofSegments) {
		let totalSpace = 0
		roofSegments.forEach((x) => {
			totalSpace += x.stats.areaMeters2
		})
		return totalSpace >= minimumRoofSize
	}

	async function geocodeLatLngs(nodes) {
		let promises = []
		let results = []
		nodes.forEach(async (x) => {
			let res = fetch(`${$page.url.origin}/solar-proposals/geocoding`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lat: getMeanLatLon(x.house.nodes).lat,
					lon: getMeanLatLon(x.house.nodes).lon
				})
			})

			promises.push(
				res.then(async (result) => results.push({ node: x, geocode: await result.json() }))
			)
		})

		await Promise.all(promises)
		return results
	}

	async function handleSubmit(event) {
		awaitingResponse = true
		errorMessage = ''
		const formData = new FormData(event.target)
		const left = formData.get('left')
		const bottom = formData.get('bottom')
		const right = formData.get('right')
		const top = formData.get('top')
		let res = await fetch(`${$page.url.origin}/solar-proposals/find-suitable-houses`, {
			method: 'POST',
			body: JSON.stringify({
				left: parseFloat(left.toString()),
				bottom: parseFloat(bottom.toString()),
				right: parseFloat(right.toString()),
				top: parseFloat(top.toString())
			}),
			headers: { 'Content-Type': 'application/json' }
		})
		if (!res.ok) {
			errorMessage = await res.text()
			awaitingResponse = false
			return
		}
		let data = await res.json()

		console.log('total num of ways/nodes/relations')
		console.log(data.elements.length)

		let buildingWays = getHousesWithDetails(data.elements)
		let buildingNodes = getNodesFromWays(buildingWays, data.elements)
		let latLongOfHouses = buildingNodes.map((x) => {
			return { house: x, latLon: getMeanLatLon(x.nodes) }
		})

		console.log(latLongOfHouses)
		let promises = latLongOfHouses.map(
			(x, i) =>
				new Promise((resolve) =>
					setTimeout(async () => {
						try {
							let response = await fetch(`${$page.url.origin}/solar-proposals/google-solar`, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({ lat: x.latLon.lat, lon: x.latLon.lon, quality: 'MEDIUM' })
							})
							let data = await response.json()
							resolve({ solarResult: data, house: x.house })
						} catch (error) {
							console.error('Error with fetch for house:', x.house, error)
							resolve(null)
						}
					}, i * 201)
				)
		)
		let googleSolarResults = []
		try {
			googleSolarResults = await Promise.all(promises)
			googleSolarResults = googleSolarResults.filter((x) => x)
		} catch (error) {
			console.error('An error occurred with the batch of promises', error)
		}

		console.log(googleSolarResults)
		let suitableHouses = []

		let housesWithASouthernRoof = googleSolarResults.filter((x) => {
			if (x.solarResult.error) return false
			return getSoutherlyRoofSections(x.solarResult.solarPotential.roofSegmentStats).length
		})

		suitableHouses = housesWithASouthernRoof.filter((x) => {
			return doesRoofHaveEnoughSpaceFor6Panels(
				getSoutherlyRoofSections(x.solarResult.solarPotential.roofSegmentStats)
			)
		})

		console.log('Suitable houses:')
		console.log(suitableHouses)

		suitableHouses.forEach(async (x) => {
			let latLon = getMeanLatLon(x.house.nodes)
			let { buildingStats, roofSegmentStats, wholeRoofStats, maxArrayAreaMeters2 } =
				x.solarResult.solarPotential
			let { data, error } = await supabase.from('south_facing_houses').upsert(
				{
					roof_details: { buildingStats, maxArrayAreaMeters2, roofSegmentStats, wholeRoofStats },
					address: await getHouseNames([x])[0],
					lat_lon: latLon
				},
				{ onConflict: 'address', ignoreDuplicates: true }
			)
		})

		awaitingResponse = false
	}

	function breakDownIntoGrid(lft, btm, top, rgt, targetArea) {
		polygons.forEach((p) => p.setMap(null))
		let gridTop = { lat: +top, lng: 0 }
		let gridBottom = { lat: +btm, lng: 0 }
		let gridLeft = { lat: 0, lng: +lft }
		let gridRight = { lat: 0, lng: +rgt }

		let currentRows = Math.floor(
			spherical.computeDistanceBetween({ lat: +btm, lng: +lft }, { lat: +top, lng: +lft }) /
				Math.sqrt(targetArea)
		)
		let currentCols = Math.floor(
			spherical.computeDistanceBetween({ lat: +btm, lng: +lft }, { lat: +btm, lng: +rgt }) /
				Math.sqrt(targetArea)
		)

		let grid = []
		for (let row = 0; row < currentRows; row++) {
			grid.push(new Array(currentCols))
			for (let col = 0; col < currentCols; col++) {
				const top = spherical.interpolate(gridTop, gridBottom, row / currentRows)
				const bottom = spherical.interpolate(gridTop, gridBottom, (row + 1) / currentRows)
				const left = spherical.interpolate(gridLeft, gridRight, col / currentCols)
				const right = spherical.interpolate(gridLeft, gridRight, (col + 1) / currentCols)
				grid[row][col] = new google.maps.LatLngBounds(
					new google.maps.LatLng(bottom.lat(), left.lng()),
					new google.maps.LatLng(top.lat(), right.lng())
				)

				const color = getRandomColor()
				const polygon = new google.maps.Rectangle({
					strokeColor: color,
					strokeOpacity: 1,
					strokeWeight: 2,
					fillColor: color,
					fillOpacity: 0.5,
					clickable: false,
					map,
					bounds: grid[row][col]
				})
				polygons = [...polygons, polygon]
			}
		}
		return grid
	}
</script>

<!-- {#if isAuthenticated}
	<MagicLink bind:isAuthenticated redirectUrl={'solar-proposals/find-suitable-houses'} />
{:else} -->
<div class="container">
	<form on:submit={getStreets}>
		<label for="left">Left Longitude:</label>
		<input type="number" step="any" id="left" name="left" bind:value={left} required />

		<label for="bottom">Bottom Latitude:</label>
		<input type="number" step="any" id="bottom" name="bottom" bind:value={bottom} required />

		<label for="right">Right Longitude:</label>
		<input type="number" step="any" id="right" name="right" bind:value={right} required />

		<label for="top">Top Latitude:</label>
		<input type="number" step="any" id="top" name="top" bind:value={top} required />
		{#key status}
			<button type="submit" disabled={awaitingResponse} bind:this={submitButton}>
				{`${awaitingResponse ? status : 'Find Suitable Houses'}`}
			</button>
		{/key}
		<input type="file" accept=".kml" on:change={handleFileChange} />
	</form>
	{#if errorMessage != ''}
		<p style="color: red">{errorMessage}</p>
	{/if}

	<div class="options">
		<label for="minimumRoofSize">Minimum Roof Size (m²)</label>
		<input type="number" id="minimumRoofSize" name="minimumRoofSize" bind:value={minimumRoofSize} />
		<label for="southFacing">South Facing</label>
		<input type="checkbox" id="southFacing" name="southFacing" bind:checked={southFacing} />
		{#if southFacing}
			<label for="southFacingThreshold"
				>South Facing Threshold <br /> (degrees from due south)</label
			>
			<input
				type="number"
				id="southFacingThreshold"
				name="southFacingThreshold"
				bind:value={southFacingThreshold}
			/>
		{/if}
		<label for="doGoogleSolar">Google Solar Lookup</label>
		<input type="checkbox" id="doGoogleSolar" name="doGoogleSolar" bind:checked={doGoogleSolar} />
		{#if doGoogleSolar}
			<label for="campaignId">Campaign: </label>
			<select name="campaignId" id="campaignId" bind:value={selectedCampaignId}>
				{#each possibleCampaigns as campaign}
					<option value={campaign['campaign_id']}>{campaign['campaign_name']}</option>
				{/each}
			</select>
		{/if}
	</div>
	<GoogleMap bind:map bind:loader minZoom={7} initialZoom={10} />
</div>

<!-- {/if} -->

<style>
	.options {
		width: fit-content;
		height: fit-content;
		align-self: center;
		display: flex;
		flex-direction: column;
		align-items: left;
		margin: 0px 10vw 10px 10vw;
	}
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
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
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
	}

	input[type='number'] {
		width: 100%;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 24px;
	}
	input[type='file'] {
		margin: 1rem auto 0 auto;
	}

	input[type='checkbox'] {
		width: fit-content;
		margin-bottom: 1rem;
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
</style>

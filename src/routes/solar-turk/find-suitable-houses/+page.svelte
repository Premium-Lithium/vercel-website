<script>
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	const headingThreshold = 15
	const minimumMountableSpace = 16
	let awaitingResponse = false
	let errorMessage = ''

	onMount(async () => {
		// let streetWays = data.elements.filter((x) => {
		// 	return x.type == 'way' && x.tags?.highway == 'residential';
		// });
		// let streetNodes = getNodesFromWays(streetWays, data.elements);
		// let eastToWestStreets = getEastToWestStreets(streetNodes);
		// console.log(eastToWestStreets);
		// let buildingsOnEastToWestStreets = [];
		// let eastToWestStreetNames = getStreetNames(eastToWestStreets);
		// buildingWays.forEach((x) => {
		// 	if (eastToWestStreetNames.includes(x.tags['addr:street']))
		// 		buildingsOnEastToWestStreets.push(x);
		// });
		// console.log(getHouseNames(buildingsOnEastToWestStreets));
	})

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
			return (
				x.type == 'way' &&
				x.tags?.building == 'house' &&
				x.tags['addr:city'] &&
				x.tags['addr:housenumber'] &&
				x.tags['addr:postcode'] &&
				x.tags['addr:street']
			)
		})
	}

	function getHouseNames(elements) {
		return elements.map(
			(x) =>
				`${x.tags['addr:housenumber']} ${x.tags['addr:street']}, ${x.tags['addr:city']}, ${x.tags['addr:postcode']}`
		)
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

		return streetNames.concat(...streetAltNames)
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
		return roofSegmentStats.filter((segment) => {
			return (
				segment.azimuthDegrees >= 180 - headingThreshold &&
				segment.azimuthDegrees <= 180 + headingThreshold
			)
		})
	}

	function doesRoofHaveEnoughSpaceFor6Panels(roofSegments) {
		let totalSpace = 0
		roofSegments.forEach((x) => {
			totalSpace += x.stats.areaMeters2
		})
		return totalSpace >= minimumMountableSpace
	}

	async function handleSubmit(event) {
		awaitingResponse = true
		errorMessage = ''
		const formData = new FormData(event.target)
		const left = formData.get('left')
		const bottom = formData.get('bottom')
		const right = formData.get('right')
		const top = formData.get('top')

		// Replace the hardcoded values with the user input
		let res = await fetch('/solar-turk/find-suitable-houses', {
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
		let promises = latLongOfHouses.map(async (x, i) => {
			try {
				let response = await fetch('/solar-turk/google-solar', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ lat: x.latLon.lat, lon: x.latLon.lon })
				})
				let data = await response.json()
				return { solarResult: data, house: x.house }
			} catch (error) {
				console.error('Error with fetch for house:', x.house, error)
			}
		})
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
					address: getHouseNames([x.house.way])[0],
					lat_lon: { lat: latLon.lat, lon: latLon.lon }
				},
				{ onConflict: 'lat_lon', ignoreDuplicates: true }
			)
		})
		awaitingResponse = false
	}
</script>

<div class="container">
	<form on:submit={handleSubmit}>
		<label for="left">Left Longitude:</label>
		<input type="number" step="any" id="left" name="left" required />

		<label for="bottom">Bottom Latitude:</label>
		<input type="number" step="any" id="bottom" name="bottom" required />

		<label for="right">Right Longitude:</label>
		<input type="number" step="any" id="right" name="right" required />

		<label for="top">Top Latitude:</label>
		<input type="number" step="any" id="top" name="top" required />

		<button type="submit" disabled={awaitingResponse}
			>{`${awaitingResponse ? 'Searching...' : 'Find Suitable Houses'}`}</button
		>
	</form>
	{#if errorMessage != ''}
		<p style="color: red">{errorMessage}</p>
	{/if}
</div>

<style>
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

	input {
		width: 100%;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
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
</style>

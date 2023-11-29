<script>
	let googleSolarResponse = undefined
	let roofSection = undefined
	let confident = false
	let errorMessage = ''
	let awaitingResponse = false
	let result

	$: if (result && !googleSolarResponse) {
		googleSolarResponse = undefined
		result.polygons.forEach(async (polygon, i) => {
			if (i !== 0) return
			const { lat, lon } = getCentroid(polygon)
			let res = await fetch(`/battery-proposals/estimate-heading-of-panel`, {
				method: 'POST',
				body: JSON.stringify({
					'coords': [{ 'lat': lat, 'lon': lon }]
				})
			})
			if (!res.ok) {
			} else {
				googleSolarResponse = await res.json()
				console.log(googleSolarResponse)
				if (
					googleSolarResponse.boundingBoxesContainingPoint.includes(
						googleSolarResponse.closestCenter
					)
				) {
					confident = true
					roofSection = googleSolarResponse.closestCenter
				} else if (googleSolarResponse.boundingBoxesContainingPoint.length == 1) {
					confident = true
					roofSection = googleSolarResponse.boundingBoxesContainingPoint[0]
				} else {
					confident = false
					roofSection = googleSolarResponse.closestCenter
				}
			}
		})
	}

	function getCentroid(polygon) {
		console.log(polygon)
		let minLat, minLon, maxLat, maxLon
		polygon.forEach((point) => {
			if (!minLat || point.lat < minLat) {
				minLat = point.lat
			}
			if (!maxLat || point.lat > maxLat) {
				maxLat = point.lat
			}
			if (!minLon || point.lon < minLon) {
				minLon = point.lon
			}
			if (!maxLon || point.lon > maxLon) {
				maxLon = point.lon
			}
		})
		console.log({ lat: (maxLat + minLat) / 2, lon: (maxLon + minLon) / 2 })
		return { lat: (maxLat + minLat) / 2, lon: (maxLon + minLon) / 2 }
	}

	async function handleSubmit(event) {
		awaitingResponse = true
		errorMessage = ''
		const formData = new FormData(event.target)
		const lat = formData.get('lat')
		const lon = formData.get('lon')
		let res = await fetch(`/battery-proposals/estimate-heading-of-panel`, {
			method: 'POST',
			body: JSON.stringify({
				'coords': [{ 'lat': lat, 'lon': lon }]
			})
		})
		if (!res.ok) {
		} else {
			googleSolarResponse = await res.json()
			if (
				googleSolarResponse.boundingBoxesContainingPoint.includes(googleSolarResponse.closestCenter)
			) {
				confident = true
				roofSection = googleSolarResponse.closestCenter
			} else if (googleSolarResponse.boundingBoxesContainingPoint.length == 1) {
				confident = true
				roofSection = googleSolarResponse.boundingBoxesContainingPoint[0]
			} else {
				confident = false
				errorMessage = 'Cannot confidently find roof section'
				roofSection = undefined
			}
		}
	}

	async function handleKMLUpload(event) {
		const formData = new FormData(event.target)
		let file = formData.get('kmlUpload')
		await parseDocument(file)
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

<div class="container">
	<form on:submit={handleSubmit}>
		<label for="lat">Latitude:</label>
		<input type="number" step="any" id="lat" name="lat" required />

		<label for="lon">Longitude:</label>
		<input type="number" step="any" id="lon" name="lon" required />

		<button type="submit">Get roof details</button>
	</form>
	<form on:submit={handleKMLUpload}>
		<label for="kmlUpload">Upload KML:</label>
		<input type="file" id="kmlUpload" name="kmlUpload" accept=".kml" required />
		<button type="submit">Get roof details</button>
	</form>
	<p>{errorMessage}</p>

	{#if roofSection}
		<p>Azimuth: {roofSection.azimuthDegrees}</p>
		<p>Pitch: {roofSection.pitchDegrees}</p>
		<p>Area: {roofSection.stats.areaMeters2}</p>
	{/if}
</div>

<style>
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 75%;
		align-items: left;
	}
</style>

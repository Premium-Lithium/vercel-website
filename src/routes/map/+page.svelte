<script>
	import { onMount } from 'svelte'
	import fetchAllPaginated from '$lib/pipedrive/fetchAllPaginated'
	import Map from '$lib/components/Map.svelte'
	let map

	onMount(() => {
		function splitArrayIntoNLengthChunks(inputArray, n) {
			return inputArray.reduce((all, one, i) => {
				const ch = Math.floor(i / n)
				all[ch] = [].concat(all[ch] || [], one)
				return all
			}, [])
		}

		async function fetchLatlonFromPostcodesPostcodes(postcodes) {
			const postcodeChunks = splitArrayIntoNLengthChunks(postcodes, 90)
			console.log(postcodeChunks)
			const locationChunks = await Promise.all(
				postcodeChunks.map(async (postcodeChunk) => {
					console.log('fetch for ', postcodeChunk.length, postcodeChunk)
					const postcodeResponse = await fetch('https://api.postcodes.io/postcodes', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ 'postcodes': postcodeChunk })
					})

					const postcodeData = await postcodeResponse.json()
					const filteredPostcodeData = postcodeData.result.filter((item) => item.result !== null)
					return filteredPostcodeData
				})
			)

			return locationChunks.reduce((x, y) => x.concat(y))
		}

		async function fetchInstallerData() {
			const data = await fetchAllPaginated({
				url: 'https://api.pipedrive.com/api/v1/organizations',
				queryParams: ['filter_id=115', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851']
			})
			console.log('done fetching paginated data')

			// Remove any postcodes that are null
			const filteredData = data.filter((item) => item.address_postal_code !== null)
			const postcodes = filteredData.map((item) => item.address_postal_code).slice(90)
			const locationData = await fetchLatlonFromPostcodesPostcodes(postcodes)

			console.log('filteredData', filteredData)
			console.log('locationData', locationData)

			// Match installer data with postcode data

			return locationData.map((data) => {
				const postcode = data.query
				const correspondingDatum = filteredData.find((x) => x.address_postal_code === postcode)
				return {
					...correspondingDatum,
					...data.result,
					type: 'installer'
				}
			})
		}

		const postcodeIndex = '80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code'
		async function fetchJobData() {
			const data = await fetchAllPaginated({
				url: 'https://api.pipedrive.com/api/v1/deals',
				queryParams: ['filter_id=55', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851']
			})

			const filteredData = data.filter((item) => item[postcodeIndex] !== null)
			const postcodes = filteredData.map((item) => item[postcodeIndex]).slice(90)
			const locationData = await fetchLatlonFromPostcodesPostcodes(postcodes)

			console.log('filteredData', filteredData)
			console.log('locationData', locationData)

			// Match job data with postcode data

			return locationData.map((data) => {
				const postcode = data.query
				const correspondingDatum = filteredData.find((x) => x[postcodeIndex] === postcode)
				return {
					...correspondingDatum,
					...data.result,
					name: correspondingDatum.title,
					type: 'job'
				}
			})

			console.log(data)
		}

		// Colors for the markers
		const colors = ['white', 'gray', 'green']
		const colouringFunction = (data) => {
			console.log(data)
			if (data.type === 'job') {
				// two possible job date sources
				// data["9ff7b589a0c2b843924928cfc1af79dadf22f563"]
				// and
				// data["f0ae912a9d78d9c102153390176de173cbd791eb"]

				let possibleFinishDate = data['9ff7b589a0c2b843924928cfc1af79dadf22f563']
				if (possibleFinishDate === null) {
					possibleFinishDate = data['f0ae912a9d78d9c102153390176de173cbd791eb']
				}
				// compare to current date
				// if in past, red

				// get current date and scheduled date
				const currentDate = new Date().setHours(0, 0, 0, 0)
				let jobDate = new Date(possibleFinishDate).setHours(0, 0, 0, 0)

				let daysDifference = Math.round((jobDate - currentDate) / (60 * 60 * 24 * 1000))

				// those in the past
				if (jobDate < currentDate) {
					return 'red'
				}

				// get degree of fade: (toggle to prioritise newest/oldest?)
				//algorithm:
				/*
                set target date
                get distance from target date
                determine colour gradient from distance
                    linear to begin with

            */
				let upperBound = 200 // days distance of minimum opacity
				let maxAlpha = 1 // maximum opacity
				let minAlpha = 0.3 // minimum opacity

				let actualAlpha

				// linear scale, sooner = brighter
				if (daysDifference > upperBound) {
					actualAlpha = minAlpha
				} else {
					actualAlpha =
						((upperBound - daysDifference) / upperBound) * (maxAlpha - minAlpha) + minAlpha
				}

				let alpha = actualAlpha
				let color = 'rgba(0, 200, 0, ' + alpha + ')'

				return color
			}
			if (data.type === 'installer') return 'blue'
			return 'red'
		}

		map.on('load', async () => {
			const installerData = await fetchInstallerData()
			const jobData = await fetchJobData()
			const data = jobData.concat(installerData)
			for (let postcode in data) {
				const marker = new mapboxgl.Marker({ color: colouringFunction(data[postcode]) })
					.setLngLat([data[postcode].longitude, data[postcode].latitude])
					.addTo(map)

				const popup = new mapboxgl.Popup({ offset: 25 }).setText(data[postcode].name)

				marker.setPopup(popup) // Associate the popup with the marker

				// add mouseenter event to marker
				marker.getElement().addEventListener('mouseenter', () => marker.togglePopup())
				// add mouseleave event to marker
				marker.getElement().addEventListener('mouseleave', () => marker.togglePopup())
			}
		})
	})
</script>

<Map bind:map search={true} style={0} />

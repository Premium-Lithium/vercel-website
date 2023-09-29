<script lang="ts">
	import { latLongOfMarker, markersOnMap, colourOfMapMarker } from '$lib/MapStores.js';

	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	export let search = true;
	export let map = undefined;
	export let installationArr;
	export let selectedFiltersArr;
	let markers = [];
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
	$latLongOfMarker = { latitude: null, longitude: null };
	$markersOnMap = [];
	const styles = [
		'mapbox://styles/mapbox/streets-v12', // 0
		'mapbox://styles/mapbox/outdoors-v12', // 1
		'mapbox://styles/mapbox/light-v11', // 2
		'mapbox://styles/mapbox/dark-v11', // 3
		'mapbox://styles/mapbox/satellite-v9', // 4
		'mapbox://styles/mapbox/satellite-streets-v12', // 5
		'mapbox://styles/mapbox/navigation-day-v1', // 6
		'mapbox://styles/mapbox/navigation-night-v1'
	]; // 7

	export let style = 5;
	import { onMount } from 'svelte';

	class Installation {
		name: String;
		status: String;
		marker: mapboxgl.Marker;
		address: String;
		lat: Number;
		lon: Number;
		// Other values ie timeframe etc.
		constructor(name: String, status: String, address: String, lat: Number, lon: Number) {
			this.name = name;
			this.status = status;
			this.marker = new mapboxgl.Marker({
				draggable: false
			}).setLngLat([lon, lat]);
			this.address = address;
			this.lat = lat;
			this.lon = lon;
		}

		// Set colour of marker based on status

		// Show/hide marker from filter
	}

	// Filter function
	/**
	 * Loop through markers array
	 * 	if *filter* applicable to MapMarker
	 */

	onMount(() => {
		const mapboxGlAccessToken =
			'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
		mapboxgl.accessToken = mapboxGlAccessToken;
		map = new mapboxgl.Map({
			container: 'map',
			style: styles[style],
			center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
			zoom: 5 // zoom level
		});

		map.on('load', async () => {
			if (search) {
				const search = new MapboxGeocoder({
					accessToken: mapboxGlAccessToken,
					mapboxgl: mapboxgl,
					marker: false,
					flyTo: {
						speed: 2.5
					},
					collapsed: true
				});
				search.on('result', (e) => {
					$markersOnMap.forEach((m) => m.remove());
					$latLongOfMarker.latitude = e.result.geometry.coordinates[1];
					$latLongOfMarker.longitude = e.result.geometry.coordinates[0];
					const marker = new mapboxgl.Marker({ draggable: true, color: $colourOfMapMarker })
						.setLngLat([$latLongOfMarker.longitude, $latLongOfMarker.latitude])
						.addTo(map);
					$markersOnMap = [marker];
					marker.on('dragend', () => {
						let lngLat = marker.getLngLat();
						$latLongOfMarker.latitude = lngLat.lat;
						$latLongOfMarker.longitude = lngLat.lng;
						$markersOnMap.forEach((m) => {
							if (m != marker) m.remove();
						});
						$markersOnMap = [marker];
					});
				});
				map.addControl(search);
			}
			console.log(selectedFiltersArr);
			if (installationArr) {
				createMarkers(installationArr);
				console.log(markers);
				filterMarkers(markers);
			}

			map.resize();
		});
	});

	function filterMarkers(markers) {
		markers.forEach((marker) => {
			// Check if the marker's status is in the selected filters
			const shouldShow = selectedFilters.has(marker.status);
			// Show or hide the marker based on the condition
			if (shouldShow) {
				marker.addTo(map);
			} else {
				marker.remove();
			}
		});
	}

	// Creates an array of MapMarker objects from an array of inputs
	async function createMarkers(installationArr) {
		for (let i in installationArr) {
			let lonLat = await fetchLonLatFromAddress(installationArr[i].address);
			let install = new Installation(
				installationArr[i].name,
				installationArr[i].status,
				installationArr[i].address,
				lonLat[1],
				lonLat[0]
			);
			markers.push(install);
		}
		addMarkers(markers);
	}

	// Adds markers from an array of locations (Markers)
	function addMarkers(markers) {
		for (let loc in markers) {
			markers[loc].marker.addTo(map);
		}
	}

	// Clears all markers from the map
	function clearMarkers() {
		for (let i in markers) {
			markers[i].marker.remove();
		}
		markers = [];
	}

	// Returns in form of [lon, lat]
	async function fetchLonLatFromAddress(address) {
		const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
		try {
			const geocodingResponse = await fetch(endpoint);
			if (geocodingResponse.ok) {
				const data = await geocodingResponse.json();
				const longLat = [
					data.features[0].geometry.coordinates[0],
					data.features[0].geometry.coordinates[1]
				];
				return longLat;
			} else {
				console.error('Bad Response');
			}
		} catch (error) {
			console.error('Bad Catch');
		}
	}
</script>

<svelte:head>
	<script
		src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"
	></script>
	<link
		rel="stylesheet"
		href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css"
		type="text/css"
	/>
</svelte:head>

<div id="map" />

<style>
	#map {
		width: 100%;
		height: 100%;
	}
</style>

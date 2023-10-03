<script lang="ts">
	import {
		latLongOfMarker,
		markersOnMap,
		colourOfMapMarker
	} from '$lib/MapStores.js';

	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	export let search = true;
	export let map = undefined;
	export let installationArr; //received from the Page
	export let selectedInstallation;
	export let filtersArr = [];
	export let directionsArr = [];

	
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

	import { createEventDispatcher } from 'svelte';
	import Loading from './Loading.svelte';

	const dispatch = createEventDispatcher();

	onMount(() => {
		const mapboxGlAccessToken =
			'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
		mapboxgl.accessToken = mapboxGlAccessToken;
		map = new mapboxgl.Map({
			container: 'map',
			style: styles[style],
			center: [-3.435973, 53.378051], // longitude and latitude of the center of the UK
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

			if (directionsArr) {
				getDirections(directionsArr);
			}
			map.resize();
		});
	});


	function handleMarkerClick(installation) {
		console.log('Marker clicked:', installation);
		dispatch('markerClick', { installation });
	}


	// Adds markers from an array of locations (Markers)
	function addMarkerPopups(installations) {
		for (let i in installations) {
			let popup = new mapboxgl.Popup({ className: 'pin-popup' })
				.setLngLat([installations[i].lon, installations[i].lat])
				.setHTML(
					'<style>.pin-popup .mapboxgl-popup-content { background-color: #091408;}</style>' +
						installations[i].name +
						'<br>' +
						installations[i].status +
						'<br>' +
						installations[i].address
				);
			installations[i].marker.setPopup(popup).addTo(map);
			installations[i].marker.getElement().addEventListener('click', () => {
				// Access the stored installations[i] variable
			});
		}
	}

	// Clears all markers from the map
	function clearMarkers() {
		for (let i in installations) {
			installations[i].marker.remove();
		}
		installations = [];
	}

	// Returns in form of [lon, lat]
	

	// directions are  [[lon, lat],...]
	export async function getDirections(directions) {
		const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${directions[0][0]},${directions[0][1]};${directions[1][0]},${directions[1][1]}?geometries=geojson&access_token=${API_TOKEN}`;
		try {
			const directionsResponse = await fetch(endpoint, { method: 'GET' });
			if (directionsResponse.ok) {
				const res = await directionsResponse.json();
				//console.log(res);
				const route = res.routes[0].geometry.coordinates;
				const geojson = {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: route
					}
				};
				map.addLayer({
					id: 'route',
					type: 'line',
					source: {
						type: 'geojson',
						data: geojson
					},
					layout: {
						'line-join': 'round',
						'line-cap': 'round'
					},
					paint: {
						'line-color': '#ab1bcf',
						'line-width': 5,
						'line-opacity': 0.75
					}
				});
			}
		} catch (error) {
			console.error("Error: " + error);
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

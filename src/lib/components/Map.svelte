<script lang="ts">
	import {
		latLongOfMarker,
		markersOnMap,
		colourOfMapMarker,
		installationStores,
		currentInstallation,

		selectedInstallation

	} from '$lib/MapStores.js';
	import { get } from 'svelte/store'
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	export let search = true;
	export let map = undefined;
	export let projectsArr;
	export let filtersArr = [];
	export let directionsArr = [];
	let installations: Array<Installation> = [];
	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
	$latLongOfMarker = { latitude: null, longitude: null };
	$markersOnMap = [];
	$currentInstallation;
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

	const statusColors = {
		'Project Handover': 'orange',
		'Awaiting Site Survey': 'yellow',
		'Site Survey Confirmed': 'blue',
		'Site Survey Completed': 'black',
		'DNO Application': 'green',
		'Pre-Installation': 'red',
		'Installation Confirmed': 'purple',
		'Installation Complete': 'cyan'
	};

	export let style = 5;
	import { onMount } from 'svelte';

	import { createEventDispatcher } from 'svelte';
	import Loading from './Loading.svelte';

	const dispatch = createEventDispatcher();

	class Installation {
		name: String;
		status: String;
		marker: mapboxgl.Marker;
		address: String;
		lat: Number;
		lon: Number;
		hidden: Boolean;
		startDate: String;
		endDate: String;
		id: Number;
		createdDate: String;
		
		// Other values ie timeframe etc.
		constructor(
			name: String,
			status: String,
			address: String,
			lat: Number,
			lon: Number,
			startDate: String,
			endDate: String,
			id: Number,
			createdDate: String,
		) {
			this.name = name;
			this.status = status;
			this.marker = new mapboxgl.Marker({
				color: statusColors[status],
				draggable: false
			}).setLngLat([lon, lat]);
			this.address = address;
			this.lat = lat;
			this.lon = lon;
			if (filtersArr.includes(this.status)) {
				this.hidden = false;
			} else {
				this.hidden = true;
			}
			this.startDate = startDate;
			this.endDate = endDate;
			this.id = id;
			this.createdDate = createdDate;
		}
	}
	
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
			
			if (projectsArr) {
				installations = await createMarkers(projectsArr);
				installationStores.set(installations);
				/*
				if(selectedMarker){
					for (let i in installations){
						if(installations[i].id === selectedMarker.id){
							currentInstallation = installations[i]
						}
					}
					//find installations with matching id
					currentInstallation.marker.togglePopup();
				}*/
			}
			
			if($selectedInstallation.length >= 2){
				directionsArr = [
					[$selectedInstallation[0].lon, $selectedInstallation[0].lat],
					[$selectedInstallation[1].lon, $selectedInstallation[1].lat]
				]
				getDirections(directionsArr);
			}
			

			if (directionsArr) {
				getDirections(directionsArr);
			}
			map.resize();
		});
	});

	function handleMarkerClick(installation) {
		dispatch('markerClick', { installation });
	}

	// Creates an array of MapMarker objects from an array of inputs
	async function createMarkers(projectsArr) {
		for (let i in projectsArr) {
			let lonLat = await fetchLonLatFromAddress(projectsArr[i].address);
			let install = new Installation(
				projectsArr[i].name,
				projectsArr[i].status,
				projectsArr[i].address,
				lonLat[1],
				lonLat[0],
				projectsArr[i].startDate,
				projectsArr[i].endDate,
				projectsArr[i].id,
				projectsArr[i].createdDate
			);
			installations.push(install);
			$installationStores.push(install);
		}
		addMarkers(installations)
		return installations;
	}

	// Adds markers from an array of locations (Markers)
	function addMarkers(markerArr) {
		for (let i in markerArr) {
			if (!markerArr[i].hidden) {
				let popup = new mapboxgl.Popup({ className: 'pin-popup' })
					.setLngLat([markerArr[i].lon, markerArr[i].lat])
					.setHTML(
						'<style>.pin-popup .mapboxgl-popup-content { background-color: #091408;}</style>' +
							'Title: ' +
							markerArr[i].name +
							'<br>' +
							'Phase: ' +
							markerArr[i].status +
							'<br>' +
							'Address: ' +
							markerArr[i].address +
							'<br>' +
							'Start Date: ' +
							markerArr[i].startDate
					);
					markerArr[i].marker.setPopup(popup).addTo(map);
				// Add an event listener for the click event
				markerArr[i].marker.getElement().addEventListener('click', () => {
					markerArr[i].marker.togglePopup()
					currentInstallation.set(markerArr[i]);
					$selectedInstallation.push(markerArr[i]);
				});
				markerArr[i].marker.getElement().style.cursor = 'pointer';
			}
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
	async function fetchLonLatFromAddress(address) {
		const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
		try {
			const geocodingResponse = await fetch(endpoint);
			if (geocodingResponse.ok) {
				const data = await geocodingResponse.json();
				const lonLat = [
					data.features[0].geometry.coordinates[0],
					data.features[0].geometry.coordinates[1]
				];
				return lonLat;
			} else {
				console.error('Bad Response');
			}
		} catch (error) {
			console.error('Bad Catch');
		}
	}




	// directions are  [[lon, lat],...]
	export async function getDirections(directions) {
		const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${directions[0][0]},${directions[0][1]};${directions[1][0]},${directions[1][1]}?geometries=geojson&access_token=${API_TOKEN}`;
		try {
			const directionsResponse = await fetch(endpoint, { method: 'GET' });
			if (directionsResponse.ok) {
				const res = await directionsResponse.json();
				console.log(res);
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
<script lang="ts">
	import type { Response, Request, MarkerOptions, Options } from "./MapTypes"
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { onMount } from 'svelte'
	import { movable } from '@svelte-put/movable'

	let mapMarkers: Array<MarkerOptions> = []
	let map: any, loader: any

	onMount(async () => {
		console.time('Start')
		await updateMapWithOptions({ option: 0 })
		console.timeEnd('Start')
	})

	/**
	 * Sends request to server to get map marker data and updates the map
	 * @param opts the option and any data required to send to the server to retrieve necessary data
	 */
	async function updateMapWithOptions(opts: Options) {
		let mapRes = await fetch('/big-map', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ opts })
		})
		let mapProps = mapRes.json()
		if (mapRes.ok) {
			// Do marker stuff
			// Do map region stuff
		}
		// Error handling
	}

	/**
	 * Goes through the markers array and if the marker is meant to be visible, adds it to the map
	 */
	function updateMap() {
		for (let i in mapMarkers) {
			if (mapMarkers[i].visible) {
				mapMarkers[i].marker.setMap(map)
			}
		}
	}

	// BASIC PROCESS FOR ADDING MARKERS
	function testMarker() {
		// Clear the map
		mapMarkers.length = 0

		// Get the map markers from some source
		for (let i = 0; i < 10; i++) {
			let marker: MarkerOptions = {
				latLng: { lat: 53.9606746 + i / 10, lng: -1.1155305 - i / 10 },
				address: '86 Poppleton Road, Holgate, York, YO26 4UP',
				visible: true,
				marker: undefined,
				content: "Test marker"
			}
			// Add all markers to the map
			mapMarkers.push(addMarker(marker))
		}
		// Update the map
		updateMap()
	}

	/**
	 * Creates a marker object for a given set of parameters
	 * 	including location and pop up window
	 * @param opts Marker parameters
	 */
	function addMarker(opts: MarkerOptions) {
		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(opts.latLng.lat, opts.latLng.lng),
			title: opts.address
		})
		let markerPopup = new google.maps.InfoWindow({
			content: opts.content,
			ariaLabel: opts.address
		})
		marker.addListener('click', () => {
			markerPopup.open({
				anchor: marker,
				map
			})
		})
		opts.marker = marker
		return opts
	}
</script>

<!-- 
TODO List
Add handle to draggable control panel
Style draggable control panel
-->
<div class="map-container">
	<div class="control-panel" use:movable>
		<button on:click={testMarker}>Add markers</button>
		<div class="filter-controls">
			<label>
				<input type="checkbox" />
				Filter 1</label
			>
			<label>
				<input type="checkbox" />
				Filter 2</label
			>
		</div>
	</div>
	<div id="map">
		<GoogleMap
			bind:map
			bind:loader
			minZoom={7}
			initialZoom={7}
			initialCenter={{ lat: 55, lng: -3 }}
		/>
	</div>
</div>

<style>
	.map-container {
		position: relative;
		width: 100%;
		height: 100%;
	}
	#map {
		width: 100%;
		height: 100%;
	}
	.control-panel {
		position: absolute;
		display: flex;
		flex-direction: row;
		width: 20%;
		height: auto;
		background-color: #b0b2b4;
		border-radius:8px;
		justify-content: left;
		padding: 8px;
		z-index: 1000;
	}
</style>

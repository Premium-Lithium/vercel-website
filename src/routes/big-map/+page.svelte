<script lang="ts">
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { onMount } from 'svelte'
	import { movable } from '@svelte-put/movable'

	interface Options {
		option: number
	}

	interface MarkerOptions {
		latLng: LatLongObj
		address: string
		visible: boolean
		marker: any | undefined
	}

	interface LatLongObj {
		lat: number
		lng: number
	}

	let mapMarkers: Array<MarkerOptions> = []

	const initialCenter = { lat: 55, lng: -3 }
	let map, loader, loadingMarkerManager: boolean

	function updateMap() {
		loader.importLibrary('marker').then(async (m) => {
			for (let i in mapMarkers) {
				if (mapMarkers[i].visible) {
					mapMarkers[i].marker.setMap(map)
				}
			}
		})
	}
		

	onMount(async () => {
		await updateMapWithOptions({ option: 0 })
	})

	async function updateMapWithOptions(opts: Options) {
		let mapRes = await fetch('/big-map', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ opts })
		})
		let mapProps = mapRes.json()
		if (mapRes.ok) {
			// Update map
		}
		// Error handling
	}

	function testMarker() {
		let marker: MarkerOptions = {
			latLng: { lat: 53.9606746, lng: -1.1155305 },
			address: '86 Poppleton Road, Holgate, York, YO26 4UP',
			visible: true,
			marker: undefined
		}
		mapMarkers.push(addMarker(marker))
		updateMap()
	}

	function addMarker(opts: MarkerOptions) {
		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(opts.latLng.lat, opts.latLng.lng),
			title: opts.address
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
		<GoogleMap bind:map bind:loader minZoom={7} initialZoom={7} {initialCenter} />
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
		width: 20%;
		background-color: crimson;
		display: flex;
		flex-direction: row;
		height: 24px;
		justify-content: center;
		padding: 8px;
		z-index: 1000;
	}
</style>

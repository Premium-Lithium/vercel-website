<script lang="ts">
	import type { MapResponse, MapRequest, MarkerOptions, } from "./MapTypes"
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { movable } from '@svelte-put/movable'
	import Map from "$lib/components/Map.svelte"

	let mapMarkers: Array<MarkerOptions> = []
	let filtersApplied: Array<string> = []
	let map: any, loader: any
	let filters: Array<string> = ['Test 1', 'Test 2', 'Test 3', 'Test 4']

	/**
	 * Sends request to server to get map marker data and updates the map
	 * @param opts the option and any data required to send to the server to retrieve necessary data
	 */
	async function updateMapWithOptions(opts: MapRequest) {
		let mapRes = await fetch('/big-map', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ opts })
		})
		let mapProps = await mapRes.json()
		if (mapRes.ok) {
			for (let prop in mapProps.body) {
				let marker = addMarker(mapProps.body[prop])
				mapMarkers.push(marker)
			}
			updateMap()
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

	function addFilter(filter: string) {
		if (filtersApplied.includes(filter)) {
			const index = filtersApplied.indexOf(filter)
			filtersApplied.splice(index, 1)
		} else {
			filtersApplied.push(filter)
		}
		for (let f in filtersApplied) {
			for (let m in mapMarkers) {
				if (!(filtersApplied[f] in mapMarkers[m].filterOption)) {
					mapMarkers[m].visible = false
				}
			}
		}
		updateMap()
	}

	function clearFilters() {
		filtersApplied.length = 0;
		let checkboxes = document.getElementsByName('filter-checkboxes')
		for (let box in checkboxes) {
			try {
				checkboxes[box].checked = false
			}
			catch {
				break
			}
		}
		updateMap()
	}
	
</script>

<!-- 
TODO List
Add handle to draggable control panel
Style draggable control panel
-->
<div class="map-container">
	<div class="control-panel" use:movable>
		<button on:click={clearFilters}>Clear Filters</button>
		<div class="filter-controls">
			{#each filters as  filter }
			<label>
				<input name="filter-checkboxes" type="checkbox" on:click={() => addFilter(filter)}/>
				{filter}</label
			>
			{/each}
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

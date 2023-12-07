<script lang="ts">
	import type { MapResponse, MapRequest, MarkerOptions, PipeLineKey, OptionPanel } from './MapTypes'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { movable } from '@svelte-put/movable'
	import ColorPicker from 'svelte-awesome-color-picker'
	import { onMount } from 'svelte'

	let pipelines: Array<PipeLineKey> = [] // Array of all pipelines and IDs
	let selectedPipelines: Array<number> = [] // Array of selected pipelines filtered by
	let mapOptionPanels: Array<OptionPanel> = []
	let map: any, loader: any
	let handle: HTMLElement
	let icon: string

	onMount(async () => {
		let res = await fetch('/big-map', {
			method: 'POST',
			headers: {
				'Content-Type': 'application-json'
			},
			body: JSON.stringify({ option: -1 })
		})
		let response = await res.json()
		pipelines = response.body
		const iconStream = fetch('/marker-base.svg')
		icon = await (await iconStream).text()
	})

	/**
	 *
	 */
	function updateMap() {
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				if (mapOptionPanels[panel].markers[marker].visible) {
					mapOptionPanels[panel].markers[marker].marker.setMap(map)
				} else {
					mapOptionPanels[panel].markers[marker].marker.setMap(null)
				}
			}
		}
	}

	function clearMap() {
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				if (mapOptionPanels[panel].markers[marker].visible) {
					mapOptionPanels[panel].markers[marker].marker.setMap(null)
				}
			}
			mapOptionPanels[panel].markers.length = 0
		}
		updateMap()
	}

	/**
	 * Creates a new icon with a given colour
	 * @param panel group of markers to update
	 */
	async function changeIconColourFor(panel: OptionPanel) {
		const newIconString = icon.replace('#888888', panel.colour)
		const newIcon = new google.maps.Icon(newIconString)
		for (let m in panel.markers) {
			panel.markers[m].marker.setIcon(newIcon)
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
			title: opts.address,
			icon: '/marker-base.svg'
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

	/**
	 * adds a given filter to the array of filters applied, and updates the map
	 * if the filter is already in the list, it removes it
	 * @param filter string of filter to be added
	 */
	function addFilter(panel: OptionPanel, filter: string) {}

	/**
	 * Clears filters applied array, sets all checkboxes to true, and updates the map
	 */
	function clearFilters(panel: OptionPanel) {}

	function deletePanel(panel: OptionPanel) {
		for (let m in panel.markers) {
			panel.markers[m].visible = false
		}
		updateMap()
		mapOptionPanels = mapOptionPanels.filter((item) => item !== panel)
	}

	/**
	 * Adds the selected pipeline to the list of selected pipelines, removes it if already in list
	 * @param pipeline object containing name and id
	 */
	function addPipelineCheckbox(pipeline: PipeLineKey) {
		if (selectedPipelines.includes(pipeline.id)) {
			const index = selectedPipelines.indexOf(pipeline.id)
			selectedPipelines.splice(index, 1)
		} else {
			selectedPipelines.push(pipeline.id)
		}
	}

	/**
	 * Gets deals from all pipelines in selectedPipelines, creates map marker objects, and puts them on the map
	 */
	async function selectPipelines() {
		clearMap()
		clearPipelineCheckboxes()
		let mapRes = await fetch('/big-map', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ option: 1, body: selectedPipelines })
		})
		let mapProps = await mapRes.json()
		if (mapRes.ok) {
			for (let p in selectedPipelines) {
				let panel: OptionPanel = {
					pipeline: pipelines.find((obj) => obj.id === selectedPipelines[p]),
					stages: [],
					stagesVisible: [],
					filters: [],
					filtersApplied: [],
					markers: [],
					colour: '',
					handle: document.createElement('div')
				}
				mapOptionPanels.push(panel)
			}
			for (let m in mapProps.body) {
				let marker: MarkerOptions = {
					latLng: mapProps.body[m].latLng,
					address: mapProps.body[m].address,
					visible: true,
					marker: undefined,
					content: mapProps.body[m].content,
					filterOption: [],
					pipelineId: mapProps.body[m].pipelineId,
					stageId: ''
				}
				mapOptionPanels
					.find(
						(obj) =>
							obj.pipeline === pipelines.find((obj) => obj.id === parseInt(marker.pipelineId))
					)
					?.markers.push(addMarker(marker))
			}
			mapOptionPanels = [...mapOptionPanels] // Instantiate a 'new' array for reactivity
			updateMap()
		}
	}

	function clearPipelineCheckboxes() {
		while (mapOptionPanels.length !== 0) deletePanel(mapOptionPanels[0])
	}
</script>

<!-- 
TODO List
Style draggable control panel
Implement dropdown checkboxes: https://flowbite-svelte.com/docs/components/dropdown
-->
<div class="map-container">
	<div class="control-panel" use:movable={{ handle }}>
		<div class="filter-controls">
			<div class="header-row">
				<h4>Pipelines</h4>
				<div class="handle" bind:this={handle}>.</div>
			</div>
			<div class="pipeline-checkboxes">
				{#each pipelines as pipeline}
					<label>
						<input
							name="pipeline-checkboxes"
							type="checkbox"
							on:click={() => addPipelineCheckbox(pipeline)}
						/>
						{pipeline.name}</label
					>
				{/each}
			</div>
			<div class="pipeline-checkbox-buttons">
				<button on:click={selectPipelines}>Display Selected Pipelines</button>
				<button on:click={clearPipelineCheckboxes}>Clear Pipeline Selection</button>
			</div>
		</div>
	</div>
	{#each mapOptionPanels as panel}
		<div class="option-panel" use:movable={{ handle:panel.handle }}>
			<div class="header-row">
				<h4>{panel.pipeline?.name}: {panel.markers.length} Markers</h4>
				<div class="handle" bind:this={ panel.handle }>.</div>
			</div>
			<div class="filter-checkboxes">
				{#each panel.filters as filter}
					<label>
						<input
							name="filter-checkboxes"
							type="checkbox"
							on:click={() => addFilter(panel, filter)}
						/>
						{filter}</label
					>
				{/each}
			</div>
			<div class="colour-picker">
				<ColorPicker bind:hex={panel.colour} />
				<br />
			</div>
			<div class="clear-filter-checkboxes">
				<button on:click={() => clearFilters(panel)}>Clear Filters</button>
			</div>
			<div class="set-marker-colour">
				<button on:click={() => changeIconColourFor(panel)}>Change Marker Colour</button>
			</div>
			<div class="delete-panel">
				<button on:click={() => deletePanel(panel)}>Remove from Map</button>
			</div>
		</div>
	{/each}
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
		flex-direction: column;
		width: auto;
		height: auto;
		background-color: #b0b2b4;
		border-radius: 8px;
		border: 2px solid black;
		justify-content: left;
		padding: 8px;
		z-index: 1000;
	}

	.header-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.handle {
		background-color: #a157de;
		display: flex;
		justify-content: center;
		vertical-align: middle;
		border: 1px solid black;
		border-radius: 8px;
		height: 32px;
		width: 32px;
	}
	.option-panel {
		position: absolute;
		display: flex;
		flex-direction: column;
		width: auto;
		height: auto;
		background-color: #b0b2b4;
		border: 1px solid black;
		border-radius: 8px;
		justify-content: left;
		padding: 8px;
		z-index: 1000;
	}
	.pipeline-checkboxes {
		display: flex;
		flex-direction: column;
	}
</style>

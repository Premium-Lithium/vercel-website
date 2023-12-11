<script lang="ts">
	import type { MarkerOptions, PipeLineKey, OptionPanel } from './MapTypes'
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
	let loading: boolean = false
	let value: number = 0
	let statusFilters: Array<string> = []

	onMount(async () => {
		loading = true
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
		loading = false
	})

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
				// Loop over each stage in pipeline, add name to the list
				panel.stages = panel.pipeline?.stages.map((obj) => obj.name)
				mapOptionPanels.push(panel)
			}
			for (let m in mapProps.body) {
				let marker: MarkerOptions = {
					latLng: mapProps.body[m].latLng,
					address: mapProps.body[m].address,
					visible: true,
					marker: undefined,
					content: mapProps.body[m].content,
					filterOption: mapProps.body[m].filterOption,
					pipelineId: mapProps.body[m].pipelineId,
					stageId: mapProps.body[m].stageId
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

	/**
	 *	Go through each panels' markers and if they are meant to be visible, add them to the map, if not remove them
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

	/**
	 * Deletes panels until all panels are gone
	 */
	function clearPipelineCheckboxes() {
		while (mapOptionPanels.length !== 0) deletePanel(mapOptionPanels[0])
	}

	/**
	 * removes all markers for a panel on the map and deletes the panel
	 * @param panel
	 */
	function deletePanel(panel: OptionPanel) {
		for (let m in panel.markers) {
			panel.markers[m].visible = false
		}
		updateMap()
		mapOptionPanels = mapOptionPanels.filter((item) => item !== panel)
	}

	/**
	 * Remove all markers from the map and empty all marker arrays
	 */
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
	 * Adds the chosen stage to the filter array for that panel
	 * @param panel panel to operate on
	 * @param stage stage to filter by for that panel
	 */
	function addStage(panel: OptionPanel, stage: string) {
		panel.stagesVisible.push(stage)
	}

	/**
	 * Goes through all panels and sets all their markers to invisible
	 */
	function makeAllMarkersInvisible() {
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				mapOptionPanels[panel].markers[marker].visible = false
			}
		}
		updateMap()
	}

	function applyFilters() {
		console.log(value, statusFilters)
		makeAllMarkersInvisible()
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				if (
					mapOptionPanels[panel].markers[marker].filterOption.value >= value &&
					(statusFilters.includes(mapOptionPanels[panel].markers[marker].filterOption.status) ||
						statusFilters.length === 0)
				) {
					mapOptionPanels[panel].markers[marker].visible = true
				}
			}
		}
		updateMap()
	}

	function clearFilters() {
		value = 0
		statusFilters.length = 0
		applyFilters()
	}

	/**
	 *
	 * @param status
	 */
	function filterByStatus(status: string) {
		if (statusFilters.includes(status)) {
			statusFilters.splice(statusFilters.indexOf(status), 1)
		} else {
			statusFilters.push(status)
		}
	}

	/**
	 * hides that panels markers from the map, adds only the wanted markers back to it
	 * @param panel the current panel being operated on
	 */
	function applyStages(panel: OptionPanel) {
		for (let marker in panel.markers) {
			panel.markers[marker].visible = false
		}
		updateMap()
		if (panel.stagesVisible.length === 0) {
			for (let marker in panel.markers) {
				panel.markers[marker].visible = true
			}
		} else {
			for (let stage in panel.stagesVisible) {
				let pipeline = pipelines.find((obj) => obj.id === panel.pipeline?.id)
				let stageId = pipeline?.stages.find((obj) => obj.name === panel.stagesVisible[stage])?.id
				for (let marker in panel.markers) {
					if (stageId === panel.markers[marker].stageId.toString()) {
						panel.markers[marker].visible = true
					}
				}
			}
		}
		updateMap()
	}

	/**
	 * Clears the stage filtering for the panel
	 * @param panel panel to operate on
	 */
	function clearStages(panel: OptionPanel) {
		panel.stagesVisible.length = 0
		updateMap()
		// Set checkboxes to false
	}

	/**
	 * Creates a new icon with a given colour
	 * @param panel group of markers to update
	 */
	async function changeIconColourFor(panel: OptionPanel) {
		const newIconString = icon.replace('#C9FC50', panel.colour)
		for (let m in panel.markers) {
			panel.markers[m].marker.setIcon(newIconString)
		}
	}

	async function createNewIconWith(colour: string) {
		const svgMarker = {
			fillColor: colour,
		}
	}

</script>

<!-- 
TODO List
Implement dropdown checkboxes: https://flowbite-svelte.com/docs/components/dropdown
Get custom markers working
-->
<div class="map-container">
	<div class="control-panel" use:movable={{ handle }}>
		{#if loading}
			<p>Loading</p>
		{:else}
			<div class="filter-controls">
				<div class="header-row">
					<h3>Pipelines</h3>
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
				<h3>Filters</h3>
				<div class="filters">
					<div class="value-slider">
						<label class="value-slider">
							Only show deals with values above
							<input name="value-slider" type="number" bind:value />
						</label>
					</div>
					<div class="status-options">
						<label class="value-slider">
							Only show deals with status:
							<label>
								Won
								<input name="won-status" type="checkbox" on:click={() => filterByStatus('won')} />
							</label>
							<label>
								Open
								<input name="won-status" type="checkbox" on:click={() => filterByStatus('open')} />
							</label>
							<label>
								Lost
								<input name="won-status" type="checkbox" on:click={() => filterByStatus('lost')} />
							</label>
						</label>
					</div>
					<div class="filter-buttons">
						<button on:click={applyFilters}>Apply Filters</button>
						<button on:click={clearFilters}>Clear Filters</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
	{#each mapOptionPanels as panel}
		<div class="option-panel" use:movable={{ handle: panel.handle }}>
			<div class="header-row">
				<h4>{panel.pipeline?.name}: {panel.markers.length} Markers</h4>
				<div class="handle" bind:this={panel.handle}>.</div>
			</div>
			<div class="colour-picker">
				<ColorPicker bind:hex={panel.colour} />
				<br />
			</div>
			<div class="set-marker-colour">
				<button on:click={() => changeIconColourFor(panel)}>Change Marker Colour</button>
			</div>
			<div class="stage-checkboxes">
				{#each panel.stages as stage}
					<label>
						<input
							name="stage-checkboxes"
							type="checkbox"
							on:click={() => addStage(panel, stage)}
						/>
						{stage}</label
					>
				{/each}
			</div>
			<div class="stage-buttons">
				<div class="add-checked-stages">
					<button on:click={() => applyStages(panel)}>Apply Stages</button>
				</div>
				<div class="clear-stage-checkboxes">
					<button on:click={() => clearStages(panel)}>Clear Stages</button>
				</div>
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
			mapId={"b304734e07437047"}
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
		background-color: #d0d1d2;
		border-radius: 8px;
		border: 2px solid #3a4339;
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
		background-color: #35bbed;
		display: flex;
		justify-content: center;
		vertical-align: middle;
		border: 1px solid #3a4339;
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
		background-color: #d0d1d2;
		border: 1px solid #3a4339;
		border-radius: 8px;
		justify-content: left;
		padding: 8px;
		z-index: 1000;
	}
	.pipeline-checkboxes {
		display: flex;
		flex-direction: column;
	}

	.stage-checkboxes {
		display: flex;
		flex-direction: column;
	}

	.stage-buttons {
		display: flex;
		flex-direction: row;
	}
	.filters {
		display: flex;
		flex-direction: column;
	}
	.value-slider {
		display: flex;
		flex-direction: column;
	}
</style>

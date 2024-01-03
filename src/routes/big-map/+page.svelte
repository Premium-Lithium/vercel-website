<script lang="ts">
	import type { MarkerOptions, PipeLineKey, OptionPanel, LabelInfo } from './MapTypes'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { movable } from '@svelte-put/movable'
	import ColorPicker from 'svelte-awesome-color-picker'
	import { onMount } from 'svelte'
	import { DateInput } from 'date-picker-svelte'

	let pipelines: Array<PipeLineKey> = [] // Array of all pipelines and IDs
	let selectedPipelines: Array<number> = [] // Array of selected pipelines filtered by
	let mapOptionPanels: Array<OptionPanel> = []
	let map: any, loader: any
	let handle: HTMLElement
	let helpHandle: HTMLElement
	let loading: boolean = false
	let icon: string
	let value: number = 0
	let labels: Array<LabelInfo> = []
	let statusFilters: Array<string> = []
	let feedbackOptions: Array<string> = []
	let feedbackMessage: string
	let feedbackSubmitted: boolean = false
	let wonDate: Date = new Date(1420977600000)
	let installDate: Date = new Date(1420977600000)
	let quoteDate: Date = new Date(1420977600000)
	let checkWonTime: boolean = false
	let checkInstalledTime: boolean = false
	let checkQuoteTime: boolean = false
	let showNullMarkers: boolean = false
	let heatmap: google.maps.visualization.HeatmapLayer
	let hidePipelineOptions: boolean = false
	let hideFilterOptions: boolean = false
	let labelFilter: Array<string> = [] // Array of label IDs, not names
	let applyLabelColourToMarker: boolean = false
	let hideLabelOptions: boolean = false

	const colourMap = new Map([
		['yellow', '#E1F378'],
		['brown', '#302411'],
		['purple', '#222F60'],
		['orange', '#F9BF3B'],
		['blue', '#35BBED'],
		['red', '#F0302E'],
		['pink', '#F6A19A'],
		['green', '#C9FC50'],
		['dark-gray', '#464748']
	])

	onMount(async () => {
		loading = true
		generateHeatmap()
		let pipelinesRes = await fetch('/big-map', {
			method: 'POST',
			headers: {
				'Content-Type': 'application-json'
			},
			body: JSON.stringify({ option: -1 })
		})
		let pipelinesResponse = await pipelinesRes.json()
		pipelines = pipelinesResponse.body
		let labelsRes = await fetch('/big-map', {
			method: 'POST',
			headers: {
				'Content-Type': 'application-json'
			},
			body: JSON.stringify({ option: -2 })
		})
		let labelsResponse = await labelsRes.json()
		labels = labelsResponse.body
		const iconStream = fetch('/marker-base.svg')
		icon = await (await iconStream).text()
		loading = false
	})

	/**
	 * Gets deals from all pipelines in selectedPipelines, creates map marker objects, and puts them on the map
	 */
	async function selectPipelines() {
		clearMap()
		// clearPipelineCheckboxes()
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
					colour: '#C9FC50',
					handle: document.createElement('div'),
					hideStageOptions: false
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
					stageId: mapProps.body[m].stageId,
					deal: mapProps.body[m].deal,
					colour: mapProps.body[m].colour,
					labelID: mapProps.body[m].labelID
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
		let checkboxes = document.getElementsByName("pipeline-checkbox")
		for (let box of checkboxes) {
			box.checked = false
		}
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

	/**
	 * checks against each date filter (separately as some of the filters may not be chosen)
	 * @param marker
	 */
	function checkDateFilterFor(marker: MarkerOptions): boolean {
		let showMarker = true
		if (marker.deal) {
			if (checkWonTime) {
				if (marker.deal.won_time) {
					showMarker = new Date(marker.deal.won_time) > wonDate ? true : false
				} else {
					showMarker = showNullMarkers
				}
			}
			if (checkQuoteTime) {
				if (marker.deal['e448eb2611c9c8a6aeca674511aa64c0a4d06520']) {
					showMarker =
						new Date(marker.deal['e448eb2611c9c8a6aeca674511aa64c0a4d06520']) > installDate
							? true
							: false
				} else {
					showMarker = showNullMarkers
				}
			}
			if (checkInstalledTime && marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) {
				if (marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) {
					new Date(marker.deal['81fcad47a18a049303b461e360c0ec2d6c9fa68e']) > quoteDate
						? true
						: false
				} else {
					showMarker = showNullMarkers
				}
			}
		} else {
			showMarker = showNullMarkers
		}
		return showMarker
	}

	function applyFilters() {
		makeAllMarkersInvisible()
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				if (
					checkDateFilterFor(mapOptionPanels[panel].markers[marker]) &&
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
		let checkboxes = document.getElementsByName("filter-checkbox")
		for (let box of checkboxes) {
			box.checked = false
		}
		wonDate = new Date(1420977600000)
		installDate = new Date(1420977600000)
		quoteDate = new Date(1420977600000)
		applyFilters()
	}

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
		makeAllMarkersInvisible()
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

	function updateLabelFilter(label: LabelInfo) {
		if (labelFilter.includes(label.id)) {
			labelFilter.splice(labelFilter.indexOf(label.id), 1)
		} else {
			labelFilter.push(label.id)
		}
	}

	function clearLabelFilters() {
		labelFilter.length = 0
		let checkboxes = document.getElementsByName("label-checkbox")
		for (let box of checkboxes) {
			box.checked = false
		}
		filterByLabel()
	}

	function filterByLabel() {
		makeAllMarkersInvisible()
		for (let panel in mapOptionPanels) {
			for (let marker in mapOptionPanels[panel].markers) {
				let label = labels.find((el) => el.id === mapOptionPanels[panel].markers[marker].labelID)
				if (label !== undefined) {
					if (labelFilter.length === 0) {
						mapOptionPanels[panel].markers[marker].visible = true
					} else {
						if (labelFilter.includes(label.id)) {
							mapOptionPanels[panel].markers[marker].visible = true
						}
					}
					if (applyLabelColourToMarker) {
						mapOptionPanels[panel].colour = colourMap.get(label.color) // temporary for now, until each marker has its own colour picker
						mapOptionPanels[panel].markers[marker].colour = colourMap.get(label.color) // These errors are never an issue - it won't get here if label is undefined
					}
					console.log(mapOptionPanels[panel].markers[marker].colour)
				}
			}
			changeIconColourFor(mapOptionPanels[panel])
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
		let checkboxes = document.getElementsByName("stage-checkbox")
		for (let box of checkboxes) {
			box.checked = false
		}
	}

	function changeIconColourFor(panel: OptionPanel) {
		for (let marker in panel.markers) {
			panel.markers[marker].colour = panel.colour // Temporary for now, until each stage has its own colour picker
			const svgMarker = {
				path: 'M 15.00,14.00 C 15.00,14.00 14.54,17.32 14.54,17.32 14.23,19.63 13.42,21.86 12.17,23.84 12.17,23.84 12.17,23.84 12.17,23.84 11.00,25.69 10.22,27.76 9.86,29.91 9.86,29.91 9.54,31.83 9.54,31.83M 4.00,14.00 C 4.00,14.00 4.36,17.35 4.36,17.35 4.61,19.69 5.42,21.92 6.73,23.87 6.73,23.87 6.73,23.87 6.73,23.87 7.96,25.70 8.75,27.77 9.06,29.95 9.06,29.95 9.32,31.88 9.32,31.88M 17.50,8.50 C 17.50,12.92 13.92,16.50 9.50,16.50 5.08,16.50 1.50,12.92 1.50,8.50 1.50,4.08 5.08,0.50 9.50,0.50 13.92,0.50 17.50,4.08 17.50,8.50 Z',
				scale: 1,
				fillColor: panel.markers[marker].colour,
				fillOpacity: 1,
				anchor: new google.maps.Point(9, 33)
			}
			panel.markers[marker].marker.setIcon(svgMarker)
		}
	}

	async function sendFeedbackEmail() {
		const message = formEmailContent()
		await fetch('/send-mail', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sender: 'peter.gillingham@premiumlithium.com',
				recipients: ['peter.gillingham@premiumlithium.com'],
				subject: 'Big Map Feedback',
				mail_body: message,
				content_type: 'HTML'
			})
		})
		feedbackSubmitted = true
	}

	function formEmailContent(): string {
		let message: string = ''
		for (let i in feedbackOptions) {
			message += feedbackOptions[i] + ', '
		}
		message += '\n'
		message += feedbackMessage
		return message
	}

	function addFeedbackOptions(option: string) {
		if (feedbackOptions.includes(option)) {
			feedbackOptions.splice(feedbackOptions.indexOf(option), 1)
		} else {
			feedbackOptions.push(option)
		}
	}

	async function toggleHeatmap() {
		if (heatmap.getMap() === map) {
			heatmap.setMap(null)
		} else {
			heatmap.setMap(map)
		}
	}

	async function generateHeatmap() {
		let heatmapData: Array<google.maps.LatLng> = []
		const heatRes = await fetch('./heatmapCoords.csv')
		const data = await heatRes.text()
		const lines = data.split('\n')
		for (let line = 2; line < lines.length; line++) {
			let row = lines[line].split(',')
			if (!isNaN(parseFloat(row[0])) && !isNaN(parseFloat(row[1])))
				heatmapData.push(new google.maps.LatLng(parseFloat(row[0]), parseFloat(row[1])))
		}
		heatmap = new google.maps.visualization.HeatmapLayer({
			data: heatmapData
		})
	}
</script>

<div class="map-container">
	<div class="control-panel" id="control-panel" use:movable={{ handle }}>
		{#if loading}
			<p>Loading</p>
		{:else}
			<div class="filter-controls">
				<div class="header-row">
					<h2>Map Options</h2>
					<div class="handle" bind:this={handle}>.</div>
				</div>
				<div class="header-tab">
					{#if !hidePipelineOptions}
						<button
							class="dropdown-button"
							on:click={() => (hidePipelineOptions = !hidePipelineOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{:else}
						<button
							class="dropdown-button"
							on:click={() => (hidePipelineOptions = !hidePipelineOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon-rotated">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{/if}
					<h3>Pipelines</h3>
				</div>
				{#if hidePipelineOptions}
					<div class="pipeline-checkboxes">
						{#each pipelines as pipeline}
							<label>
								<input
									name="pipeline-checkbox"
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
				{/if}
				<div class="header-tab">
					{#if !hideFilterOptions}
						<button
							class="dropdown-button"
							on:click={() => (hideFilterOptions = !hideFilterOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{:else}
						<button
							class="dropdown-button"
							on:click={() => (hideFilterOptions = !hideFilterOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon-rotated">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{/if}
					<h3>Filters</h3>
				</div>
				<div class="filters">
					{#if hideFilterOptions}
						<div class="value-slider">
							<label class="value-slider">
								Only show deals with values above
								<input name="value-slider" type="number" class="filter-value" bind:value />
							</label>
						</div>
						<div class="status-options">
							<label class="value-slider">
								Only show deals with status:
								<label>
									<input name="filter-checkbox" type="checkbox" on:click={() => filterByStatus('won')} />
									Won
								</label>
								<label>
									<input
										name="filter-checkbox"
										type="checkbox"
										on:click={() => filterByStatus('open')}
									/>
									Open
								</label>
								<label>
									<input
										name="filter-checkbox"
										type="checkbox"
										on:click={() => filterByStatus('lost')}
									/>
									Lost
								</label>
							</label>
							<label>
								Only show deals won after:
								<div class="time-filter">
									<input name="filter-checkbox" type="checkbox" bind:checked={checkWonTime} />
									<DateInput timePrecision={'minute'} bind:value={wonDate} />
								</div>
							</label>
							<label>
								Only show deals installed after:
								<div class="time-filter">
									<input name="filter-checkbox" type="checkbox" bind:checked={checkInstalledTime} />
									<DateInput timePrecision={'minute'} bind:value={installDate} />
								</div>
							</label>
							<label>
								Only show deals quoted after:
								<div class="time-filter">
									<input name="filter-checkbox" type="checkbox" bind:checked={checkQuoteTime} />
									<DateInput timePrecision={'minute'} bind:value={quoteDate} />
								</div>
							</label>
						</div>
						<label>
							<input type="checkbox" name="filter-checkbox" bind:checked={showNullMarkers} />
							Show markers with no filter data
						</label>
						<div class="filter-buttons">
							<button on:click={applyFilters}>Apply Filters</button>
							<button on:click={clearFilters}>Clear Filters</button>
						</div>
					{/if}
				</div>
				<div class="labels">
					<div class="header-tab">
						{#if !hideLabelOptions}
							<button
								class="dropdown-button"
								on:click={() => (hideLabelOptions = !hideLabelOptions)}
							>
								<svg width="18" height="19" class="dropdown-icon">
									<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
								</svg>
							</button>
						{:else}
							<button
								class="dropdown-button"
								on:click={() => (hideLabelOptions = !hideLabelOptions)}
							>
								<svg width="18" height="19" class="dropdown-icon-rotated">
									<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
								</svg>
							</button>
						{/if}
						<h3>Labels</h3>
					</div>
					{#if hideLabelOptions}
						<div class="label-options">
							<div class="label-checkboxes">
								{#each labels as pdLabel}
									<div class="label-options">
										<label>
											<input type="checkbox" name="label-checkbox" on:click={() => updateLabelFilter(pdLabel)} />
											{pdLabel.name}
										</label>
									</div>
								{/each}
							</div>
							<p />
							<div class="label-controls">
								<div>
									<input type="checkbox" name="label-checkbox" bind:checked={applyLabelColourToMarker} />
									Apply Label Colour to Marker
								</div>
								<div class="label-select-button">
									<button on:click={filterByLabel}> Apply Labels </button>
									<button on:click={clearLabelFilters}> Clear Labels </button>
								</div>
							</div>
						</div>
					{/if}
				</div>
				<div class="heatmap">
					<h3>Solar Install Heatmap</h3>
					<p>Residential solar installs across the UK</p>
					<div class="heatmap-button">
						<button on:click={toggleHeatmap}>Toggle Heatmap</button>
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
				<div class="header-tab">
					{#if !panel.hideStageOptions}
						<button
							class="dropdown-button"
							on:click={() => (panel.hideStageOptions = !panel.hideStageOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{:else}
						<button
							class="dropdown-button"
							on:click={() => (panel.hideStageOptions = !panel.hideStageOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon-rotated">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{/if}
					<h4>Stages</h4>
				</div>
				{#if panel.hideStageOptions}
					{#each panel.stages as stage}
						<label>
							<input
								name="stage-checkbox"
								type="checkbox"
								on:click={() => addStage(panel, stage)}
							/>
							{stage}</label
						>
					{/each}
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
				{/if}
			</div>
		</div>
	{/each}
	<div class="option-panel" use:movable={{ handle: helpHandle }}>
		<div class="filter-controls">
			<div class="header-row">
				<h3>Feedback</h3>
				<div class="handle" bind:this={helpHandle}>.</div>
			</div>
			<p>Provide your feedback with the fields below</p>
			<div class="stage-checkboxes">
				<h5>Tick all that apply:</h5>
				<label>
					<input
						id="bug-checkbox"
						name="feedback-checkboxes"
						type="checkbox"
						on:click={() => addFeedbackOptions('Bug')}
					/>Bug</label
				>
				<label>
					<input
						id="feature-checkbox"
						name="feedback-checkboxes"
						type="checkbox"
						on:click={() => addFeedbackOptions('Feature')}
					/>Feature</label
				>
				<textarea
					id="feedback-textarea"
					name="feedback-form"
					class="feedback-form"
					bind:value={feedbackMessage}
				/>
				<div class="clear-stage-checkboxes">
					<button on:click={sendFeedbackEmail}>Submit Feedback</button>
				</div>
			</div>
		</div>
		{#if feedbackSubmitted}
			<p>Thanks!</p>
		{/if}
	</div>
	<div id="map">
		<GoogleMap
			bind:map
			bind:loader
			minZoom={7}
			initialZoom={7}
			initialCenter={{ lat: 55, lng: -3 }}
			mapId={'b304734e07437047'}
		/>
	</div>
</div>

<style>
	button,
	input {
		cursor: pointer;
	}

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
		z-index: 3;
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
		z-index: 2;
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

	.feedback-form {
		width: 96%;
		height: 80px;
	}

	.time-filter {
		display: flex;
		flex-direction: row;
	}

	.header-tab {
		display: flex;
		flex-direction: row;
	}

	.dropdown-button {
		background-color: #d0d1d2;
		border: none;
	}

	.dropdown-icon {
		position: relative;
		transform: scale(0.8);
		top: 2px;
	}
	.dropdown-icon-rotated {
		position: relative;
		top: 2px;
		transform: scale(0.8) rotate(90deg);
	}

	.label-controls {
		display: flex;
		flex-direction: column;
	}

	.label-select-button {
		display: flex;
		flex-direction: row;
	}

	.label-options {
		display: flex;
		flex-direction: column;
	}
</style>

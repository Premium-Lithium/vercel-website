<script lang="ts">
	import {
		type OptionPanel,
		applyLabelColourToMarker,
		checkInstalledTime,
		checkQuoteTime,
		checkWonTime,
		feedbackMessage,
		feedbackSubmitted,
		heatmap,
		hideFilterOptions,
		hideLabelOptions,
		hidePipelineOptions,
		installDate,
		labelFilter,
		labels,
		map,
		mapOptionPanels,
		pipelines,
		quoteDate,
		selectedPipelines,
		showNullMarkers,
		value,
		wonDate
	} from './bm-stores'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { movable } from '@svelte-put/movable'
	import ColorPicker from 'svelte-awesome-color-picker'
	import { onMount } from 'svelte'
	import { DateInput } from 'date-picker-svelte'
	import {
		generateHeatmap,
		getLabels,
		getPipelines,
		getSelectedPipelineData,
		updateMap,
		deletePanel,
		makeAllMarkersInvisible,
		clearMap,
		applyFilters,
		setFiltersToDefaultValues,
		applyFiltersToPanel,
		addPipelineCheckbox,
		filterByLabel,
		filterByStatus,
		sendFeedbackEmail,
		updateLabelFilter,
		changeIconColourFor,
		addFeedbackOptions
	} from './bm-utils'

	let loader: any
	let handle: HTMLElement
	let helpHandle: HTMLElement
	let loading: boolean = false

	onMount(async () => {
		loading = true
		await generateHeatmap()
		await getPipelines()
		await getLabels()
		loading = false
	})

	/**
	 * Gets deals from all pipelines in selectedPipelines, creates map marker objects, and puts them on the map
	 */
	async function selectPipelines() {
		clearMap()
		await getSelectedPipelineData($selectedPipelines)
		updateMap()
	}

	/**
	 * Deletes panels until all panels are gone
	 */
	function clearPipelineCheckboxes() {
		while ($mapOptionPanels.length !== 0) deletePanel($mapOptionPanels[0])
		let checkboxes = document.getElementsByName('pipeline-checkbox')
		for (let box of checkboxes) {
			box.checked = false
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

	function clearFilters() {
		setFiltersToDefaultValues()
		let checkboxes = document.getElementsByName('filter-checkbox')
		for (let box of checkboxes) {
			box.checked = false
		}
	}

	function clearLabelFilters() {
		$labelFilter.length = 0
		let checkboxes = document.getElementsByName('label-checkbox')
		for (let box of checkboxes) {
			box.checked = false
		}
		filterByLabel()
	}

	/**
	 * Clears the stage filtering for the panel
	 * @param panel panel to operate on
	 */
	function clearStages(panel: OptionPanel) {
		panel.stagesVisible.length = 0
		updateMap()
		let checkboxes = document.getElementsByName('stage-checkbox')
		for (let box of checkboxes) {
			box.checked = false
		}
	}

	/**
	 * hides that panels markers from the map, adds only the wanted markers back to it
	 * @param panel the current panel being operated on
	 */
	function applyStages(panel: OptionPanel) {
		makeAllMarkersInvisible()
		panel = applyFiltersToPanel(panel)
		updateMap()
	}

	async function toggleHeatmap() {
		if ($heatmap.getMap() === $map) {
			$heatmap.setMap(null)
		} else {
			$heatmap.setMap($map)
		}
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
					{#if !$hidePipelineOptions}
						<button
							class="dropdown-button"
							on:click={() => ($hidePipelineOptions = !$hidePipelineOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{:else}
						<button
							class="dropdown-button"
							on:click={() => ($hidePipelineOptions = !$hidePipelineOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon-rotated">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{/if}
					<h3>Pipelines</h3>
				</div>
				{#if $hidePipelineOptions}
					<div class="pipeline-checkboxes">
						{#each $pipelines as pipeline}
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
					{#if !$hideFilterOptions}
						<button
							class="dropdown-button"
							on:click={() => ($hideFilterOptions = !$hideFilterOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{:else}
						<button
							class="dropdown-button"
							on:click={() => ($hideFilterOptions = !$hideFilterOptions)}
						>
							<svg width="18" height="19" class="dropdown-icon-rotated">
								<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
							</svg>
						</button>
					{/if}
					<h3>Filters</h3>
				</div>
				<div class="filters">
					{#if $hideFilterOptions}
						<div class="value-slider">
							<label class="value-slider">
								Only show deals with values above
								<input name="value-slider" type="number" class="filter-value" bind:value={$value} />
							</label>
						</div>
						<div class="status-options">
							<label class="value-slider">
								Only show deals with status:
								<label>
									<input
										name="filter-checkbox"
										type="checkbox"
										on:click={() => filterByStatus('won')}
									/>
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
									<input name="filter-checkbox" type="checkbox" bind:checked={$checkWonTime} />
									<DateInput timePrecision={'minute'} bind:value={$wonDate} />
								</div>
							</label>
							<label>
								Only show deals installed after:
								<div class="time-filter">
									<input
										name="filter-checkbox"
										type="checkbox"
										bind:checked={$checkInstalledTime}
									/>
									<DateInput timePrecision={'minute'} bind:value={$installDate} />
								</div>
							</label>
							<label>
								Only show deals quoted after:
								<div class="time-filter">
									<input name="filter-checkbox" type="checkbox" bind:checked={$checkQuoteTime} />
									<DateInput timePrecision={'minute'} bind:value={$quoteDate} />
								</div>
							</label>
						</div>
						<label>
							<input type="checkbox" name="filter-checkbox" bind:checked={$showNullMarkers} />
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
						{#if !$hideLabelOptions}
							<button
								class="dropdown-button"
								on:click={() => ($hideLabelOptions = !$hideLabelOptions)}
							>
								<svg width="18" height="19" class="dropdown-icon">
									<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
								</svg>
							</button>
						{:else}
							<button
								class="dropdown-button"
								on:click={() => ($hideLabelOptions = !$hideLabelOptions)}
							>
								<svg width="18" height="19" class="dropdown-icon-rotated">
									<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
								</svg>
							</button>
						{/if}
						<h3>Labels</h3>
					</div>
					{#if $hideLabelOptions}
						<div class="label-options">
							<div class="label-checkboxes">
								{#each $labels as pdLabel}
									<div class="label-options">
										<label>
											<input
												type="checkbox"
												name="label-checkbox"
												on:click={() => updateLabelFilter(pdLabel)}
											/>
											{pdLabel.name}
										</label>
									</div>
								{/each}
							</div>
							<p />
							<div class="label-controls">
								<div>
									<input
										type="checkbox"
										name="label-checkbox"
										bind:checked={$applyLabelColourToMarker}
									/>
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
	{#each $mapOptionPanels as panel}
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
					bind:value={$feedbackMessage}
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
			bind:map={$map}
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

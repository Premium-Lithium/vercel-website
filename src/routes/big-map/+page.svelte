<script lang="ts">
	import {
		type OptionPanel,
		map,
		mapOptionPanels,
		layersLoading,
		postcodeFilteringVisible
	} from './bm-stores'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { movable } from '@svelte-put/movable'
	import ColorPicker from 'svelte-awesome-color-picker'
	import { onMount } from 'svelte'
	import {
		getLabels,
		getPipelines,
		updateMap,
		deletePanel,
		makeAllMarkersInvisible,
		applyFiltersToPanel,
		changeIconColourFor,
		generateMarkersForMCSSInstallers
	} from './bm-pipedrive-utils'
	import { generateCampaignHeatmap, generateOsHeatmap } from './bm-heatmap-utils'
	import {
		generatePlatformMarkers,
		updateHomeownerMarkers,
		updateInstallerMarkers
	} from './bm-platform-utils'
	import PipedriveSection from '$lib/components/big-map/PipedriveSection.svelte'
	import HeatmapSection from '$lib/components/big-map/HeatmapSection.svelte'
	import CampaignSection from '$lib/components/big-map/CampaignSection.svelte'
	import { getCampaignIdAndNames } from './bm-campaign-utils'
	import FloatingPanel from '$lib/components/big-map/FloatingPanel.svelte'
	import PlatformSection from '$lib/components/big-map/PlatformSection.svelte'
	import { supabase } from '$lib/supabase'
	import KnownInstallerSection from '$lib/components/big-map/KnownInstallerSection.svelte'
	import PostcodeFilter from '$lib/components/big-map/PostcodeFilter.svelte'
	import { loadKmlLayers } from './bm-postcode-utils'
	import MenuButton from '$lib/components/big-map/MenuButton.svelte'

	let loader: any

	const homeownerSubscription = supabase
		.channel('platform-homeowners')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'platform_homeowners' },
			async (payload) => {
				await updateHomeownerMarkers(payload)
			}
		)
		.subscribe()

	const installerSubscription = supabase
		.channel('platform_installers')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'platform_installers' },
			async (payload) => {
				await updateInstallerMarkers(payload)
			}
		)
		.subscribe()

	onMount(async () => {
		await Promise.all([
			loadKmlLayers(),
			generateMarkersForMCSSInstallers(),
			getCampaignIdAndNames(),
			generateOsHeatmap(),
			generatePlatformMarkers(),
			getPipelines(),
			getLabels()
		])
		// has to come after the campaign function
		generateCampaignHeatmap()
	})

	/**
	 * Adds the chosen stage to the filter array for that panel
	 * @param panel panel to operate on
	 * @param stage stage to filter by for that panel
	 */
	function addStage(panel: OptionPanel, stage: string) {
		panel.stagesVisible.push(stage)
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
</script>

<div class="map-container">
	<div class="interface">
		<FloatingPanel panelTitle="Map Options">
			<PipedriveSection />
			<HeatmapSection />
			<CampaignSection />
			<PlatformSection />
			<KnownInstallerSection />
			<MenuButton
				title={($layersLoading) ? "Loading Postcode Regions" : "Postcode Filter Options"}
				buttonClass="secondary"
				on:click={() => ($postcodeFilteringVisible = !$postcodeFilteringVisible)}
				disabled={$layersLoading}
			/>
		</FloatingPanel>
		{#if !$layersLoading && $postcodeFilteringVisible}
			<PostcodeFilter />
		{/if}
		{#each $mapOptionPanels as panel}
			<!-- terribly ugly part needs refactoring into component -->
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
				<div class="checkbox-stack">
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
						<div class="labelled-checkbox">
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
	@font-face {
		font-family: 'Visby CF';
		font-weight: 900;
		src: url(/fonts/VisbyCF/VisbyCF-Heavy.otf) format('opentype');
	}
	@font-face {
		font-family: 'Visby CF';
		font-weight: 700;
		src: url(/fonts/VisbyCF/VisbyCF-Bold.otf) format('opentype');
	}
	@font-face {
		font-family: 'Visby CF';
		font-weight: 600;
		src: url(/fonts/VisbyCF/VisbyCF-DemiBold.otf) format('opentype');
	}
	@font-face {
		font-family: 'Visby CF';
		font-weight: 500;
		src: url(/fonts/VisbyCF/VisbyCF-Regular.otf) format('opentype');
	}

	* {
		font-family: 'Visby CF';
		font-style: normal;
		font-weight: 500;
	}

	.interface {
		color: #bbbbbb;
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
		border: 1px solid #ffffff;
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
		background-color: #091408;
		border: 1px solid #ffffff;
		border-radius: 8px;
		justify-content: left;
		padding: 4px;
		z-index: 2;
	}

	.labelled-checkbox {
		display: flex;
		flex-direction: row;
	}

	.checkbox-stack {
		display: flex;
		flex-direction: column;
	}

	.header-tab {
		display: flex;
		flex-direction: row;
	}

	.dropdown-button {
		background-color: #091408;
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
</style>

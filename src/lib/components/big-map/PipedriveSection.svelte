<script lang="ts">
	import {
		applyFilters,
		getDetailsOfVisibleMarkers
	} from '../../../routes/big-map/bm-pipedrive-utils'
	import {
		labels,
		mapOptionPanels,
		pipedriveLoading,
		pipelines
	} from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import FilterDropdown from './FilterDropdown.svelte'
	import LabelDropdown from './LabelDropdown.svelte'
	import MenuButton from './MenuButton.svelte'
	import PipelineDropdown from './PipelineDropdown.svelte'

	let shown: boolean = false
	let downloading: boolean = false

	async function detailButton() {
		downloading = true
		await getDetailsOfVisibleMarkers()
		downloading = false
	}
</script>

<DropdownHeader header="PipeDrive" bind:droppedDown={shown} />
{#if shown}
	{#if !$pipedriveLoading}
		<div class="pd-menus">
			<PipelineDropdown pipelines={$pipelines} />
			<FilterDropdown checkboxOptions={['Won', 'Open', 'Lost']} />
			<LabelDropdown labels={$labels} />
			{#if $mapOptionPanels.length > 0}
				<MenuButton
					title="Get Visible Marker Details"
					on:click={detailButton}
					buttonClass="tertiary"
					disabled={downloading}
				/>
				(May take a while for large number of markers)
			{/if}
		</div>
	{:else}
		<div class="pd-menus">
			<p>Loading</p>
		</div>
	{/if}
{/if}

<style>
	.pd-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>

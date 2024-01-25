<script lang="ts">
	import { applyFilters } from '../../../routes/big-map/bm-pipedrive-utils'
	import { filterByPostcode, labels, pipedriveLoading, pipelines } from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import FilterDropdown from './FilterDropdown.svelte'
	import LabelDropdown from './LabelDropdown.svelte'
	import MenuButton from './MenuButton.svelte'
	import PipelineDropdown from './PipelineDropdown.svelte'

	let shown: boolean = false

	function postcodeFilter() {
		$filterByPostcode = !$filterByPostcode
		applyFilters()
	}

</script>

<DropdownHeader header="PipeDrive" bind:droppedDown={shown} />
{#if shown}
	{#if !$pipedriveLoading}
		<div class="pd-menus">
			<PipelineDropdown pipelines={$pipelines} />
			<FilterDropdown checkboxOptions={['Won', 'Open', 'Lost']} />
			<LabelDropdown labels={$labels} />
			<MenuButton title="Toggle Postcode Filter" on:click={postcodeFilter} buttonClass="secondary" />
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

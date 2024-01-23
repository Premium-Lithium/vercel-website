<script lang="ts">
	import { labels, pipedriveLoading, pipelines } from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import FilterDropdown from './FilterDropdown.svelte'
	import LabelDropdown from './LabelDropdown.svelte'
	import PipelineDropdown from './PipelineDropdown.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="PipeDrive" bind:droppedDown={shown} />
{#if shown}
	{#if !$pipedriveLoading}
		<div class="pd-menus">
			<PipelineDropdown pipelines={$pipelines} />
			<FilterDropdown checkboxOptions={['Won', 'Open', 'Lost']} />
			<LabelDropdown labels={$labels} />
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

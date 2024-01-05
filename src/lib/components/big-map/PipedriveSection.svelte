<script lang="ts">
	import { labels, pipelines } from '../../../routes/big-map/bm-pd-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import FilterDropdown from './FilterDropdown.svelte'
	import LabelDropdown from './LabelDropdown.svelte'
	import PipelineDropdown from './PipelineDropdown.svelte'

    let shown: boolean = false
</script>

<DropdownHeader header="PipeDrive" bind:droppedDown={shown}/>
{#if shown}
    <div class="pd-menus">
        <PipelineDropdown pipelines={$pipelines} />
        <FilterDropdown checkboxOptions={['Won', 'Open', 'Lost']} />
        <LabelDropdown labels={$labels} />
    </div>
{/if}

<style>
    .pd-menus {
        display: flex;
        flex-direction: column;
        padding-left: 24px;
    }
</style>

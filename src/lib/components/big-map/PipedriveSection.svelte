<script lang="ts">
	import { labels, pipelines } from '../../../routes/big-map/bm-stores'
	import FilterDropdown from './FilterDropdown.svelte'
	import LabelDropdown from './LabelDropdown.svelte'
	import PipelineDropdown from './PipelineDropdown.svelte'
</script>


<div class="pd-menus">
	<PipelineDropdown pipelines={$pipelines} />
	<FilterDropdown checkboxOptions={['Won', 'Open', 'Lost']} />
	<LabelDropdown labels={$labels} />
</div>

<style>
    .pd-menus {
        display: flex;
        flex-direction: column;
    }
</style>

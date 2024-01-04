<script lang="ts">
	import { filterByLabel, updateLabelFilter } from '../../../routes/big-map/bm-pipedrive-utils'
	import { type LabelInfo, applyLabelColourToMarker, labelFilter } from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import LabelledCheckbox from './LabelledCheckbox.svelte'
	import MenuButton from './MenuButton.svelte'

	export let labels: Array<LabelInfo>
	let shown: boolean

	function handleClearLabels() {
		$labelFilter = []
		for (let label of labels) {
			let labelCheckboxes = document.getElementsByClassName('checkbox-' + label.name)
			for (let box of labelCheckboxes) {
				box.checked = false
			}
		}
		filterByLabel()
	}
</script>

<div class="dropdown">
	<DropdownHeader header={'Labels'} bind:droppedDown={shown} />
	{#if shown}
		{#each labels as label, index}
			<LabelledCheckbox label={label.name} on:change={() => updateLabelFilter(labels[index])} />
		{/each}
		<LabelledCheckbox
			label={'Apply Label Colour to Markers'}
			bind:checked={$applyLabelColourToMarker}
		/>
		<div class="controls">
			<MenuButton title="Apply Labels" on:click={filterByLabel} />
			<MenuButton title="Clear Labels" on:click={handleClearLabels} />
		</div>
	{/if}
</div>

<style>
	.dropdown {
		display: flex;
		flex-direction: column;
	}

	.controls {
		display: flex;
		flex-direction: row;
	}
	
</style>

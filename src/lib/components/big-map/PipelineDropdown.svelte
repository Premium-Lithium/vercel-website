<script lang="ts">
	import { onMount } from 'svelte'
	import {
		selectedPipelines,
		type PipeLineKey,
		mapOptionPanels
	} from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import LabelledCheckbox from './LabelledCheckbox.svelte'
	import MenuButton from './MenuButton.svelte'
	import {
		addPipelineCheckbox,
		clearMap,
		deletePanel,
		getSelectedPipelineData,
		updateMap
	} from '../../../routes/big-map/bm-pipedrive-utils'

	export let pipelines: Array<PipeLineKey>
	export let props: Array<{ name: string; colour: string; selected: boolean }> = []
	let shown: boolean

	let pipelineTitles: Array<string> = []

	onMount(() => {
		for (let pipeline of pipelines) {
			pipelineTitles.push(pipeline.name)
			props.push({ name: pipeline.name, colour: '#C9FC50', selected: false })
		}
	})

	function handleCheckboxChange(index: number) {
		props[index].selected = !props[index].selected
	}

	async function handleSelectPipelines() {
		for (let prop of props) {
			if (prop.selected) {
				let pipeline = getPipelineKeyFromName(prop.name)
				if (pipeline) {
					addPipelineCheckbox(pipeline)
				}
			}
		}
		clearMap()
		await getSelectedPipelineData($selectedPipelines)
		updateMap()
	}

	function getPipelineKeyFromName(pipelineName: string): PipeLineKey | undefined {
		return pipelines.find((el) => el.name === pipelineName)
	}

	function handleClearPipelines() {
		for (let prop of props) {
			prop.selected = false
			let checkboxElements = document.getElementsByClassName('checkbox-' + prop.name)
			for (let el of checkboxElements) {
				el.checked = false
			}
		}
		while ($mapOptionPanels.length > 0) {
			deletePanel($mapOptionPanels[0])
		}
		$selectedPipelines = []
		console.log($selectedPipelines)
	}
</script>

<div class="dropdown">
	<DropdownHeader header={'Pipeline'} bind:droppedDown={shown} />
	{#if shown}
		{#each pipelines as pipeline, index}
			<LabelledCheckbox label={pipeline.name} on:change={() => handleCheckboxChange(index)} />
		{/each}
		<div class="controls">
			<MenuButton title="Select Pipelines" on:click={handleSelectPipelines} />
			<MenuButton title="Clear Selection" on:click={handleClearPipelines} />
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

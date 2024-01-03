<svelte:options accessors />

<script lang="ts">
	import { onMount } from 'svelte'
	export let contentTitle: string
	export let checkboxArr: Array<string> = []
	export let checkboxProps: Array<{ name: string; colour: string; selected: boolean }> = []

	onMount(() => {
		for (let title of checkboxArr) {
			let prop = {
				name: title,
				colour: '#35bbed',
				selected: false
			}
			checkboxProps.push(prop)
		}
	})

	export function clearSelections() {
		let checkboxes = document.getElementsByClassName('filter-checkbox-' + contentTitle)
		for (let box of checkboxes) {
			box.checked = false
		}
		for (let prop of checkboxProps) {
			prop.selected = false
		}
	}

	function boxChecked(title: string) {
		if (checkboxProps.find((prop) => prop.name === title).selected) {
			checkboxProps.find((prop) => prop.name === title).selected = false
		} else {
			checkboxProps.find((prop) => prop.name === title).selected = true
		}
	}
</script>

<div class="content">
	{#each checkboxArr as title}
		<div class="labelled-checkbox">
			<label>
				<input
					name={'filter-checkbox ' + contentTitle}
					type="checkbox"
					on:click={() => boxChecked(title)}
				/>
				{title}
				<input
					name="colour-picker"
					type="color"
					bind:value={checkboxProps.find((prop) => prop.name === title).colour}
				/>
			</label>
		</div>
	{/each}
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
	}

	.labelled-checkbox {
		display: flex;
		flex-direction: row;
	}
</style>

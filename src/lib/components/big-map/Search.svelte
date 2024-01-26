<script lang="ts">
	import { onMount } from 'svelte'
	import { postcodeFilter, postcodes } from '../../../routes/big-map/bm-stores'
	import MenuButton from './MenuButton.svelte'
	import { get } from 'svelte/store'
	import { filterMarkersByPostcode } from '../../../routes/big-map/bm-postcode-utils'

	let inputText = ''
	let availablePostcodes = $postcodeFilter.map((postcode) => postcode.name)
	let selectedPostcodes: Array<string> = []
	let filteredPostcodes: Array<string> = []

	function filterPostcodes() {
		filteredPostcodes = availablePostcodes.filter((postcode) =>
			postcode.toLowerCase().includes(inputText.toLowerCase())
		)
	}

	function toggleSelection(postcode: string) {
		if (selectedPostcodes.includes(postcode)) {
			selectedPostcodes = selectedPostcodes.filter((selectedWord) => selectedWord !== postcode)
		} else {
			selectedPostcodes = [...selectedPostcodes, postcode]
		}
		availablePostcodes.splice(availablePostcodes.indexOf(postcode), 1)
	}

	function clearSelection() {
		selectedPostcodes = []
		filteredPostcodes = []
		availablePostcodes = $postcodeFilter.map((postcode) => postcode.name)
		inputText = ''
	}

	function filterByPostcode() {
		postcodes.set(selectedPostcodes)
		filterMarkersByPostcode()
	}

	onMount(() => {
		filterPostcodes()
	})
</script>

<input bind:value={inputText} on:input={filterPostcodes} />

{#if inputText}
	<ul>
		{#each filteredPostcodes as postcode (postcode)}
			<li>
				<label>
					<input
						type="checkbox"
						class="hidden-checkbox"
						on:change={() => toggleSelection(postcode)}
					/>
					{postcode}
				</label>
			</li>
		{/each}
		{#if filteredPostcodes.length === 0}
			<p>No Postcodes Found</p>
		{/if}
	</ul>
{/if}
{#if selectedPostcodes.length > 0}
	<p>Selected Postcodes: {selectedPostcodes.join(', ')}</p>
	<div class="buttons">
		<MenuButton title="Filter By Postcode" on:click={filterByPostcode} />
		<MenuButton title="Clear Postcodes" on:click={clearSelection} buttonClass="secondary" />
	</div>
{/if}

<style>
	.buttons {
		display: flex;
		flex-direction: row;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte'
	import DropdownHeader from './DropdownHeader.svelte'
	import LabelledCheckbox from './LabelledCheckbox.svelte'
	import MenuButton from './MenuButton.svelte'
	import DatePicker from './DatePicker.svelte'
	import ValuePicker from './ValuePicker.svelte'
	import {
		applyFilters,
		filterByStatus,
		setFiltersToDefaultValues
	} from '../../../routes/big-map/bm-pipedrive-utils'
	import {
		checkInstalledTime,
		checkQuoteTime,
		checkWonTime,
		installDate,
		quoteDate,
		value,
		wonDate
	} from '../../../routes/big-map/bm-pd-stores'
	let shown: boolean

	onMount(() => {})

	export let checkboxOptions: Array<string>

	function clearFilters() {
		setFiltersToDefaultValues()
		let datepickerCheckboxes = document.getElementsByClassName('datepicker-checkbox')
		for (let box of datepickerCheckboxes) box.checked = false
		for (let status of checkboxOptions) {
			let statusCheckboxes = document.getElementsByClassName('checkbox-' + status)
			for (let checkbox of statusCheckboxes) {
				checkbox.checked = false
			}
		}
	}
</script>

<div class="dropdown">
	<DropdownHeader header={'Filters'} bind:droppedDown={shown} />
	{#if shown}
	<div class="menu">
		<div class="checkbox-options">
			<p>Only show deals that are:</p>
			{#each checkboxOptions as checkbox}
				<LabelledCheckbox
					label={checkbox}
					on:change={() => filterByStatus(checkbox.toLowerCase())}
				/>
			{/each}
		</div>
		<div class="date-options">
			<DatePicker
				label={'Won'}
				bind:date={$wonDate}
				on:checked={() => ($checkWonTime = !$checkWonTime)}
			/>
			<DatePicker
				label={'Quoted'}
				bind:date={$quoteDate}
				on:checked={() => ($checkQuoteTime = !$checkQuoteTime)}
			/>
			<DatePicker
				label={'Installed'}
				bind:date={$installDate}
				on:checked={() => ($checkInstalledTime = !$checkInstalledTime)}
			/>
		</div>
		<div class="value-options" />
		<ValuePicker label={'Only show deals with values above'} bind:value={$value} />
		<div class="controls">
			<MenuButton title="Apply Filters" on:click={applyFilters} />
			<MenuButton title="Clear Filters" on:click={clearFilters} />
		</div>
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

	.menu {
		padding-left: 24px;
	}
</style>

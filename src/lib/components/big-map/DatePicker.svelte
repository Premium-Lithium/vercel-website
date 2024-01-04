<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import LabelledCheckbox from './LabelledCheckbox.svelte'

	export let date: string
	export let label: string
	export let selected: boolean = false

	const dispatch = createEventDispatcher()

	function dispatchChecked(event: any) {
		dispatch('checked', event.detail)
	}
</script>

<div class={'datepicker'}>
	<div class="label">
		<LabelledCheckbox
			label={'Only show deals ' + label + ' after'}
			bind:checked={selected}
			on:change={dispatchChecked}
		/>
	</div>
	<div class="date-picker-options">
		<div class="picker">
			<input type="date" class="datepicker-checkbox" bind:value={date} />
		</div>
	</div>
</div>

<style>
	.datepicker {
		display: flex;
		flex-direction: column;
	}

	.date-picker-options {
		display: flex;
		flex-direction: row;
	}
</style>

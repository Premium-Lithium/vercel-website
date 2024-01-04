<svelte:options accessors />

<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let label: string
	export let checked: boolean = false

	const dispatch = createEventDispatcher()

	function dispatchChange(event: any) {
		dispatch('change', event.detail)
	}
</script>

<div class="labelled-checkbox">
	<div class="checkbox">
		<input type="checkbox" class={'checkbox-' + label} bind:checked on:change={dispatchChange} />
	</div>
	<div class="label">
		{label}
	</div>
</div>

<style>
	.labelled-checkbox {
		display: flex;
		flex-direction: row;
	}
	
</style>

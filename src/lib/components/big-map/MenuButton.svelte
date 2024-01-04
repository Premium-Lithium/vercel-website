<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Button from './Button.svelte'

	export let title: string

	const dispatch = createEventDispatcher()

	function dispatchClick(event: any) {
		dispatch('click', event.detail)
	}
</script>

<div class="button">
	<Button label={title} on:click={dispatchClick} />
</div>

<style>
	
</style>

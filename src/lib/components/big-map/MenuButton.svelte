<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Button from './Button.svelte'

	export let title: string
	export let buttonClass: 'primary' | 'secondary' | 'tertiary' = 'primary'
	export let disabled: boolean = false

	const dispatch = createEventDispatcher()

	function dispatchClick(event: any) {
		dispatch('click', event.detail)
	}
</script>

<div class="menu-button">
	<Button label={title} {buttonClass} on:click={dispatchClick} disabled={disabled}/>
</div>

<style>
	.menu-button {
		margin: 4px;
		max-width: 240px;
	}

</style>

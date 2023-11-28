<script lang="ts">
	import { onMount } from 'svelte'
	import Landing from './Pages/Landing.svelte'
	import { PageState, currentState } from '$lib/document-builder-stores';

	console.log(PageState.Landing)

</script>

{#if $currentState === PageState.Landing}
	<Landing />
{:else if $currentState === PageState.DnoApplication}
	<!-- Page goes here -->
{:else if $currentState === PageState.Contract}
	<!-- Page goes here -->
{/if}

<style>

</style>

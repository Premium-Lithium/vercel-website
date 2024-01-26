<script lang="ts">
	import {
		displayCustomerMarkers,
		displayInstallerMarkers
	} from '../../../routes/big-map/bm-pipedrive-utils'
	import { installersLoading } from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import MenuButton from './MenuButton.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Known Installers" bind:droppedDown={shown} />
{#if shown}
	{#if !$installersLoading}
		<p>MCS Registered Installers known to Premium Lithium</p>
		<MenuButton title="Toggle MCS Installer Markers" on:click={displayInstallerMarkers} />
	{:else}
		<p>Loading</p>
	{/if}
{/if}

<!-- <MenuButton title="Toggle Customer Markers" on:click={displayCustomerMarkers} /> -->

<style>
</style>

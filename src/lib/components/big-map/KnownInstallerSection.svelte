<script lang="ts">
	import {
		displayCustomerMarkers,
		displayInstallerMarkers
	} from '../../../routes/big-map/bm-pipedrive-utils'
	import DropdownHeader from './DropdownHeader.svelte'
	import MenuButton from './MenuButton.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Known Installers" bind:droppedDown={shown} />
{#if shown}
	<p>MCS Registered Installers known to Premium Lithium</p>
	<MenuButton title="Toggle MCS Installer Markers" on:click={displayInstallerMarkers} />
{/if}

<!-- <MenuButton title="Toggle Customer Markers" on:click={displayCustomerMarkers} /> -->

<style>
</style>

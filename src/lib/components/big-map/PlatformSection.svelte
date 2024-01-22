<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'
	import { displayMarkers } from '../../../routes/big-map/bm-platform-utils'
	import MenuButton from './MenuButton.svelte'
	import {
		platformHomeownerMarkers,
		platformInstallerMarkers
	} from '../../../routes/big-map/bm-stores'

	let shown: boolean = false
	let homeownersShown: boolean = false
	let installersShown: boolean = false
</script>

<DropdownHeader header="Platform" bind:droppedDown={shown} />
{#if shown}
	<div class="pf-menus">
		<div class="platform-panel">
			<div class="homeowners">
				<DropdownHeader header="Homeowners" bind:droppedDown={homeownersShown} />
				{#if homeownersShown}
				<div class="pf-menus">
					<MenuButton
						title="Show Homeowners"
						on:click={() => ($platformHomeownerMarkers = displayMarkers($platformHomeownerMarkers))}
					/>
				</div>
				{/if}
			</div>
			<div class="installers">
				<DropdownHeader header="Installers" bind:droppedDown={installersShown} />
				{#if installersShown}
				<div class="pf-menus">
					<MenuButton
						title="Show Installers"
						on:click={() => ($platformInstallerMarkers = displayMarkers($platformInstallerMarkers))}
					/>
				</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.pf-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>

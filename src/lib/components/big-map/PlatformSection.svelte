<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'
	import { changeMarkerColour, displayMarkers } from '../../../routes/big-map/bm-platform-utils'
	import MenuButton from './MenuButton.svelte'
	import {
		platformHomeownerMarkers,
		platformInstallerMarkers
	} from '../../../routes/big-map/bm-stores'
	import ColorPicker from 'svelte-awesome-color-picker'

	let shown: boolean = false
	let homeownersShown: boolean = false
	let installersShown: boolean = false
	let homeownerColour: string = "C9FC50"
	let installerColour: string = "C9FC50"
</script>

<DropdownHeader header="Platform" bind:droppedDown={shown} />
{#if shown}
	<div class="pf-menus">
		<div class="platform-panel">
			<div class="homeowners">
				<DropdownHeader header="Homeowners" bind:droppedDown={homeownersShown} />
				{#if homeownersShown}
				<div class="pf-menus">
					<div class="colour-picker">
						<ColorPicker bind:hex={homeownerColour} />
						<MenuButton
							title="Change Colour" 
							buttonClass="secondary"
							on:click={() => ($platformHomeownerMarkers = changeMarkerColour($platformHomeownerMarkers, homeownerColour))}/>
					</div>
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
					<div class="colour-picker">
						<ColorPicker bind:hex={installerColour} />
						<MenuButton
							title="Change Colour" 
							buttonClass="secondary"
							on:click={() => ($platformInstallerMarkers = changeMarkerColour($platformInstallerMarkers, installerColour))}/>
					</div>
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

	.colour-picker {
		display: flex;
		flex-direction: row;
	}
</style>

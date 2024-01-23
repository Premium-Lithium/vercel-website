<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'
	import { changeMarkerColour, displayMarkers } from '../../../routes/big-map/bm-platform-utils'
	import MenuButton from './MenuButton.svelte'
	import {
		homeownerColour,
		installerColour,
		platformHomeownerMarkers,
		platformInstallerMarkers,
		platformLoading
	} from '../../../routes/big-map/bm-stores'
	import ColorPicker from 'svelte-awesome-color-picker'

	let shown: boolean = false
	let homeownersShown: boolean = false
	let installersShown: boolean = false
	let keyShown: boolean = false
</script>

<DropdownHeader header="Platform" bind:droppedDown={shown} />
{#if shown}
	{#if !$platformLoading}
		<div class="pf-menus">
			<div class="platform-panel">
				<div class="homeowners">
					<DropdownHeader header="Homeowners" bind:droppedDown={homeownersShown} />
					{#if homeownersShown}
						<div class="pf-menus">
							<div class="colour-picker">
								<ColorPicker bind:hex={$homeownerColour} />
								<MenuButton
									title="Change Colour"
									buttonClass="secondary"
									on:click={() =>
										($platformHomeownerMarkers = changeMarkerColour(
											$platformHomeownerMarkers,
											$homeownerColour
										))}
								/>
							</div>
							<MenuButton
								title="Show Homeowners"
								on:click={() =>
									($platformHomeownerMarkers = displayMarkers($platformHomeownerMarkers))}
							/>
						</div>
					{/if}
				</div>
				<div class="installers">
					<DropdownHeader header="Installers" bind:droppedDown={installersShown} />
					{#if installersShown}
						<div class="pf-menus">
							<div class="colour-picker">
								<ColorPicker bind:hex={$installerColour} />
								<MenuButton
									title="Change Colour"
									buttonClass="secondary"
									on:click={() =>
										($platformInstallerMarkers = changeMarkerColour(
											$platformInstallerMarkers,
											$installerColour
										))}
								/>
							</div>
							<MenuButton
								title="Show Installers"
								on:click={() =>
									($platformInstallerMarkers = displayMarkers($platformInstallerMarkers))}
							/>
						</div>
					{/if}
				</div>
				<DropdownHeader header="Key" bind:droppedDown={keyShown} />
				{#if keyShown}
					<div class="pf-menus">
						<div class="legend">
							<h4>Homeowners</h4>
							<div class="marker-key">
								<svg width="50" height="50"
									><circle cx="25" cy="25" r="24" fill={$homeownerColour} /></svg
								>
								<p>Unverified Homeowner</p>
							</div>
							<div class="marker-key">
								<svg width="50" height="50">
									<rect width="50" height="50" fill={$homeownerColour} />
								</svg>
								<p>Homeowner Awaiting Design</p>
							</div>
							<div class="marker-key">
								<svg width="50" height="50">
									<polygon points="25, 0, 0, 50, 50, 50" fill={$homeownerColour} />
								</svg>
								<p>Homeowner Pending Quotes</p>
							</div>
							<h4>Installers</h4>
							<div class="marker-key">
								<svg width="50" height="50"
									><circle cx="25" cy="25" r="24" fill={$installerColour} /></svg
								>
								<p>Unverified Installer</p>
							</div>
							<div class="marker-key">
								<svg width="50" height="50">
									<polygon points="25, 0, 0, 50, 50, 50" fill={$installerColour} />
								</svg>
								<p>Verified Installer</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="pf-menus">
			<p>Loading</p>
		</div>
	{/if}
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

	.legend {
	}
	.marker-key {
		display: flex;
		flex-direction: row;
	}
</style>

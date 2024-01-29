<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'
	import { changeMarkerColour, displayMarkers } from '../../../routes/big-map/bm-platform-utils'
	import MenuButton from './MenuButton.svelte'
	import {
		homeownerColour,
		homeownerMarkersVisible,
		installerColour,
		installerMarkersVisible,
		platformHomeownerMarkers,
		platformInstallerMarkers,
		platformLoading
	} from '../../../routes/big-map/bm-stores'
	import ColorPicker from 'svelte-awesome-color-picker'
	import LoadingWheel from './LoadingWheel.svelte'

	let shown: boolean = false
	let homeownersShown: boolean = false
	let installersShown: boolean = false
	let keyShown: boolean = false

	const keySize = 25

	function toggleHomeownerMarkers() {
		$homeownerMarkersVisible = !$homeownerMarkersVisible
		$platformHomeownerMarkers = displayMarkers($platformHomeownerMarkers)
	}

	function toggleInstallerMarkers() {
		$installerMarkersVisible = !$installerMarkersVisible
		$platformInstallerMarkers = displayMarkers($platformInstallerMarkers)
	}
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
								<div class="selector">
									<ColorPicker bind:hex={$homeownerColour} />
								</div>
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
							<MenuButton title="Toggle Homeowners" on:click={toggleHomeownerMarkers} />
						</div>
					{/if}
				</div>
				<div class="installers">
					<DropdownHeader header="Installers" bind:droppedDown={installersShown} />
					{#if installersShown}
						<div class="pf-menus">
							<div class="colour-picker">
								<div class="selector">
									<ColorPicker bind:hex={$installerColour} />
								</div>
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
							<MenuButton title="Toggle Installers" on:click={toggleInstallerMarkers} />
						</div>
					{/if}
				</div>
				{#if $installerMarkersVisible || $homeownerMarkersVisible}
					<DropdownHeader header="Key" bind:droppedDown={keyShown} />
					{#if keyShown}
						<div class="pf-menus">
							<div class="legend">
								{#if $homeownerMarkersVisible}
									<h4>Homeowners</h4>
									<div class="marker-key">
										<div class="marker-icon">
											<svg width={keySize} height={keySize}
												><circle
													cx={keySize / 2}
													cy={keySize / 2}
													r={keySize / 2 - 1}
													fill={$homeownerColour}
												/>
											</svg>
										</div>
										<p>Unverified Homeowner</p>
									</div>
									<div class="marker-key">
										<div class="marker-icon">
											<svg width={keySize} height={keySize}>
												<rect width={keySize} height={keySize} fill={$homeownerColour} />
											</svg>
										</div>
										<p>Homeowner Awaiting Design</p>
									</div>
									<div class="marker-key">
										<div class="marker-icon">
											<svg width={keySize} height={keySize}>
												<polygon
													points={`${keySize / 2}, ${0}, ${0}, ${keySize}, ${keySize}, ${keySize}`}
													fill={$homeownerColour}
												/>
											</svg>
										</div>
										<p>Homeowner Pending Quotes</p>
									</div>
								{/if}
								{#if $installerMarkersVisible}
									<h4>Installers</h4>
									<div class="marker-key">
										<div class="marker-icon">
											<svg width={keySize} height={keySize}
												><circle
													cx={keySize / 2}
													cy={keySize / 2}
													r={keySize / 2 - 1}
													fill={$installerColour}
												/></svg
											>
										</div>
										<p>Unverified Installer</p>
									</div>
									<div class="marker-key">
										<div class="marker-icon">
											<svg width={keySize} height={keySize}>
												<polygon
													points={`${keySize / 2}, ${0}, ${0}, ${keySize}, ${keySize}, ${keySize}`}
													fill={$installerColour}
												/>
											</svg>
										</div>
										<p>Verified Installer</p>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{:else}
		<div class="pf-menus">
			<LoadingWheel />
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
		margin-top: -16px;
	}

	.legend {
		display: flex;
		flex-direction: column;
	}
	.marker-key {
		display: flex;
		flex-direction: row;
		margin-left: -24px;
	}

	.selector {
		margin-top: 6px;
	}
	.marker-icon {
		margin-right: 8px;
		margin-top: 10px;
	}
</style>

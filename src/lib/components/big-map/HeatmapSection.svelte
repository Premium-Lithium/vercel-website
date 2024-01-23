<script lang="ts">
	import { toggleCampaignHeatmap, toggleHeatmap } from '../../../routes/big-map/bm-heatmap-utils'
	import { heatmapLoading } from '../../../routes/big-map/bm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import MenuButton from './MenuButton.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Heatmaps" bind:droppedDown={shown} />
{#if shown}
	{#if !$heatmapLoading}
		<div class="hm-menus">
			<div class="os-heatmap">
				<h3>Solar Install Heatmap</h3>
				<p>Residential solar installs across the UK</p>
				<div class="heatmap-button">
					<MenuButton title="Toggle Heatmap" on:click={toggleHeatmap} />
				</div>
			</div>
			<div class="campaign-heatmap">
				<h3>Solar Scan Heatmap</h3>
				<p>Our internal solar panel database</p>
				<div class="heatmap-button">
					<MenuButton title="Toggle Heatmap" on:click={toggleCampaignHeatmap} />
				</div>
			</div>
		</div>
	{:else}
		<div class="hm-menus">
			<p>Loading</p>
		</div>
	{/if}
{/if}

<style>
	.hm-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>

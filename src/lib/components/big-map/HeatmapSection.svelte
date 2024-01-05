<script lang="ts">
	import { toggleHeatmap } from '../../../routes/big-map/bm-heatmap-utils'
	import DropdownHeader from './DropdownHeader.svelte'
	import MenuButton from './MenuButton.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Heatmaps" bind:droppedDown={shown} />
{#if shown}
	<div class="hm-menus">
		<div class="os-heatmap">
			<h3>Solar Install Heatmap</h3>
			<p>Residential solar installs across the UK</p>
			<div class="heatmap-button">
				<MenuButton title="Toggle Heatmap" on:click={toggleHeatmap} />
			</div>
		</div>
		<div class="campaign-heatmap">
			
		</div>
	</div>
{/if}

<style>
	.hm-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>

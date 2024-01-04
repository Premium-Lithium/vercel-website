<script lang="ts">
	import { toggleHeatmap } from "../../../routes/big-map/bm-heatmap-utils"
	import MenuButton from "./MenuButton.svelte"

</script>

<div class="hm-menus">
	<h3>Solar Install Heatmap</h3>
	<p>Residential solar installs across the UK</p>
	<div class="heatmap-button">
		<MenuButton title="Toggle Heatmap" on:click={toggleHeatmap} />
	</div>
</div>

<style>
	.hm-menus {
		display: flex;
		flex-direction: column;
	}
</style>

<script lang="ts">
	import GridItem from './GridItem.svelte'

	let columns = 4
	let rows = 31

	// Generate an array of positions for the grid items
	let gridItems: Array<{col: number, row: number}> = []
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < columns; col++) {
			gridItems.push({ col, row })
		}
	}
    // grid items = array of 
</script>

<div class="grid-container">
	{#each gridItems as { col, row }}
        <div class="grid-item">
            <GridItem {col} {row} />
        </div>
	{/each}
</div>

<style lang="scss">
	/* Add your styling for the grid container and items here */
	.grid-container {
		display: grid;
        grid-template-columns: repeat( 4, 1fr);
	}

	.grid-item {
		border: 1px;
	}
</style>

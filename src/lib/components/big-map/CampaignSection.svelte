<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Campaigns" bind:droppedDown={shown} />
{#if shown}
	<div class="cm-menus">
		
	</div>
{/if}

<style>
	.cm-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>

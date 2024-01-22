<script lang="ts">
	import DropdownHeader from './DropdownHeader.svelte'

	let shown: boolean = false
</script>

<DropdownHeader header="Platform" bind:droppedDown={shown} />
{#if shown}
	<div class="hm-menus">
		<div class="platform-panel">
			
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

<script lang="ts">
	import { movable } from '@svelte-put/movable'

	export let panelTitle: string
	let handle: HTMLElement
</script>

<div class="floating-panel" id={'floating-panel-' + panelTitle} use:movable={{ handle: handle }}>
    <div class="header-row">
        <h2>Map Options</h2>
        <div class="handle" bind:this={handle}>.</div>
    </div>
    <slot />
</div>

<style>
    .header-row {
        display: flex;
        flex-direction: row;
		justify-content: space-between;
    }

    .floating-panel {
        position: absolute;
		display: flex;
		flex-direction: column;
		width: auto;
		height: auto;
		background-color: #091408;
		border-radius: 8px;
		border: 2px solid #ffffff;
		justify-content: left;
		padding: 8px;
		z-index: 3;
    }

    .handle {
		background-color: #35bbed;
		display: flex;
		justify-content: center;
		vertical-align: middle;
		border: 1px solid #ffffff;
		border-radius: 8px;
		height: 32px;
		width: 32px;
	}

</style>

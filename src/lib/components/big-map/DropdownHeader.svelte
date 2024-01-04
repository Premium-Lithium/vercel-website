<svelte:options accessors />

<script lang="ts">
	export let header: string
	export let droppedDown: boolean = false
</script>

<div class="dropdown-header">
	<div class="icon">
		{#if !droppedDown}
			<button class="dropdown-button" on:click={() => (droppedDown = !droppedDown)}>
				<svg width="18" height="19" class="dropdown-icon">
					<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
				</svg>
			</button>
		{:else}
			<button class="dropdown-button" on:click={() => (droppedDown = !droppedDown)}>
				<svg width="18" height="19" class="dropdown-icon-rotated">
					<path d="M0.5 17.5V1.5L16.5 9.68182L0.5 17.5Z" fill="#35bbed" stroke="black" />
				</svg>
			</button>
		{/if}
	</div>
	<div class="heading">
		<h3>{header}</h3>
	</div>
</div>

<style>
	.dropdown-icon {
		position: relative;
		transform: scale(0.8);
		top: 20px;
	}

	.dropdown-icon-rotated {
		position: relative;
		top: 20px;
		transform: scale(0.8) rotate(90deg);
	}

	.dropdown-header {
		display: flex;
		flex-direction: row;
	}

	.dropdown-button {
		background-color: #091408;
		border: none;
	}
</style>

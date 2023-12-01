<script>
	import { browser } from '$app/environment'
	import Auth from '$lib/components/Auth.svelte'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import { supabase } from '$lib/supabase'

	let supabaseAuth
	let activeArea = undefined
	let selectARegion = false
	let map, loader

	$: console.log(map)

	// supabase
	// 	.channel('room1')
	// 	.on(
	// 		'postgres_changes',
	// 		{ event: '*', schema: 'public', table: 'south_facing_houses' },
	// 		(payload) => {
	// 			console.log('Change received!', payload)
	// 		}
	// 	)
	// 	.subscribe()
</script>

{#if browser}
	{#if !supabaseAuth}
		<Auth redirectUrl="battery-proposals" bind:supabaseAuth />
	{:else}
		<div class="container">
			{#if activeArea}
				<div class="button-container">
					<button class="download-button">Download KML</button>
					<button class="complete-region-button">Complete Area</button>
				</div>
			{:else if !selectARegion}
				<h3>No region currently selected</h3>
				<div class="button-container">
					<button
						class="select-region-button"
						on:click={() => {
							selectARegion = true
						}}>Select a region</button
					>
				</div>
			{:else}
				<GoogleMap bind:map bind:loader initialZoom={12} minZoom={9} />
			{/if}
		</div>
	{/if}
{/if}

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		background-color: #f2f2f2;
		width: 100%;
		min-height: 100%;
		height: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.button-container {
		height: fit-content;
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.button-container button {
		background-color: #eaeaea;
		border-radius: 8px;
		color: black;

		cursor: pointer;
		transition: background-color 0.3s ease;
		padding: 10px 20px;
		border: 2px solid #35bbed;
	}

	.button-container button:hover {
		background-color: #dadada;
	}

	.button-container button:active {
		background-color: darken(#eaeaea, 20%);
	}

	.button-container button.disabled {
		background-color: #ccc;
	}

	.button-container button.negative {
		background-color: #e74c3c;
	}
</style>

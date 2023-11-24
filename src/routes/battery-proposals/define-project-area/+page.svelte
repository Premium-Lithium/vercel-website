<script>
	import { page } from '$app/stores'
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	let awaitingResponse = false
	let errorMessage = ''

	let left, right, bottom, top, map

	const urlParams = $page.url.searchParams
	left = urlParams.get('left') || ''
	bottom = urlParams.get('bottom') || ''
	right = urlParams.get('right') || ''
	top = urlParams.get('top') || ''

	let isAuthenticated = false

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
	})

	function handleSubmit(event) {}
</script>

{#if !isAuthenticated}
	<MagicLink bind:isAuthenticated redirectUrl={'solar-proposals/find-suitable-houses'} />
{:else}
	<div class="container">
		<form on:submit={handleSubmit}>
			<label for="left">Left Longitude:</label>
			<input type="number" step="any" id="left" name="left" bind:value={left} required />

			<label for="bottom">Bottom Latitude:</label>
			<input type="number" step="any" id="bottom" name="bottom" bind:value={bottom} required />

			<label for="right">Right Longitude:</label>
			<input type="number" step="any" id="right" name="right" bind:value={right} required />

			<label for="top">Top Latitude:</label>
			<input type="number" step="any" id="top" name="top" bind:value={top} required />

			<button type="submit" disabled={awaitingResponse}>
				{`${awaitingResponse ? 'Searching...' : 'Find Suitable Houses'}`}
			</button>
		</form>
		{#if errorMessage != ''}
			<p style="color: red">{errorMessage}</p>
		{/if}

		<div class="options">
			<label for="minimumRoofSize">Minimum Roof Size (m²)</label>
			<input
				type="number"
				id="minimumRoofSize"
				name="minimumRoofSize"
				bind:value={minimumRoofSize}
			/>
			<label for="southFacing">South Facing</label>
			<input type="checkbox" id="southFacing" name="southFacing" bind:checked={southFacing} />
			{#if southFacing}
				<label for="southFacingThreshold"
					>South Facing Threshold <br /> (degrees from due south)</label
				>
				<input
					type="number"
					id="southFacingThreshold"
					name="southFacingThreshold"
					bind:value={southFacingThreshold}
				/>
			{/if}
		</div>
	</div>
{/if}

<style>
	.options {
		width: fit-content;
		height: fit-content;
		align-self: center;
		display: flex;
		flex-direction: column;
		align-items: left;
		margin: 0px 10vw 0px 10vw;
	}
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	form {
		max-width: 300px;
		margin: 2rem auto;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #f9f9f9;
		display: flex;
		flex-direction: column;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
	}

	input[type='number'] {
		width: 100%;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 24px;
	}

	input[type='checkbox'] {
		width: fit-content;
		margin-bottom: 1rem;
	}

	button {
		width: 100%;
		padding: 0.5rem;
		border: none;
		border-radius: 4px;
		background-color: #5cb85c;
		color: white;
		cursor: pointer;
		font-size: 1rem;
	}

	button:hover {
		background-color: #4cae4c;
	}
</style>

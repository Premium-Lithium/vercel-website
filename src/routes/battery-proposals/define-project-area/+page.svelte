<script>
	import { page } from '$app/stores'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	let awaitingResponse = false
	let errorMessage = ''

	let left, right, bottom, top, targetArea, map, loader, drawingManager, spherical

	const urlParams = $page.url.searchParams
	left = urlParams.get('left') || ''
	bottom = urlParams.get('bottom') || ''
	right = urlParams.get('right') || ''
	top = urlParams.get('top') || ''

	let isAuthenticated = false
	let polygons = []

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true

		loader.importLibrary('drawing').then(async (d) => {
			drawingManager = new d.DrawingManager()
			drawingManager.setOptions({
				rectangleOptions: {
					editable: true,
					fillOpacity: 0.4,
					fillColor: '#fff',
					strokeColor: '#35bbed',
					draggable: true
				},
				drawingControlOptions: { drawingModes: [] }
			})
			drawingManager.setMap(map)
			drawingManager.setDrawingMode('rectangle')
			drawingManager.addListener('rectanglecomplete', (rect) => {
				drawingManager.setDrawingMode(null)
				let southWest = rect.bounds.getSouthWest()
				let northEast = rect.bounds.getNorthEast()
				left = southWest.lng()
				bottom = southWest.lat()
				right = northEast.lng()
				top = northEast.lat()
				rect.addListener('bounds_changed', () => {
					let southWest = rect.bounds.getSouthWest()
					let northEast = rect.bounds.getNorthEast()
					left = southWest.lng()
					bottom = southWest.lat()
					right = northEast.lng()
					top = northEast.lat()
				})
			})
		})
		loader.importLibrary('geometry').then(async (g) => {
			spherical = g.spherical
		})
	})

	function handleSubmit(event) {
		awaitingResponse = true
		errorMessage = ''
		const formData = new FormData(event.target)
		const left = formData.get('left')
		const bottom = formData.get('bottom')
		const right = formData.get('right')
		const top = formData.get('top')
		const targetArea = formData.get('targetArea')
		breakDownIntoGrid(left, bottom, top, right, targetArea * 1000000)
		awaitingResponse = false
	}

	function breakDownIntoGrid(lft, btm, top, rgt, targetArea) {
		polygons.forEach((p) => p.setMap(null))
		let gridTop = { lat: +top, lng: 0 }
		let gridBottom = { lat: +btm, lng: 0 }
		let gridLeft = { lat: 0, lng: +lft }
		let gridRight = { lat: 0, lng: +rgt }

		let currentRows = Math.floor(
			spherical.computeDistanceBetween({ lat: +btm, lng: +lft }, { lat: +top, lng: +lft }) /
				Math.sqrt(targetArea)
		)
		let currentCols = Math.floor(
			spherical.computeDistanceBetween({ lat: +btm, lng: +lft }, { lat: +btm, lng: +rgt }) /
				Math.sqrt(targetArea)
		)

		let grid = []
		for (let row = 0; row < currentRows; row++) {
			grid.push(new Array(currentCols))
			for (let col = 0; col < currentCols; col++) {
				const top = spherical.interpolate(gridTop, gridBottom, row / currentRows)
				const bottom = spherical.interpolate(gridTop, gridBottom, (row + 1) / currentRows)
				const left = spherical.interpolate(gridLeft, gridRight, col / currentCols)
				const right = spherical.interpolate(gridLeft, gridRight, (col + 1) / currentCols)
				grid[row][col] = new google.maps.LatLngBounds(
					new google.maps.LatLng(bottom.lat(), left.lng()),
					new google.maps.LatLng(top.lat(), right.lng())
				)

				const color = getRandomColor()
				const polygon = new google.maps.Rectangle({
					strokeColor: color,
					strokeOpacity: 1,
					strokeWeight: 2,
					fillColor: color,
					fillOpacity: 0.5,
					clickable: false,
					map,
					bounds: grid[row][col]
				})
				polygons.push(polygon)
			}
		}
	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF'
		var color = '#'
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)]
		}
		return color
	}
</script>

{#if isAuthenticated}
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

			<label for="targetArea">Target Area (km²):</label>
			<input
				type="number"
				step="0.1"
				id="targetArea"
				name="targetArea"
				bind:value={targetArea}
				required
			/>

			<button type="submit" disabled={awaitingResponse}>
				{`${awaitingResponse ? 'Splitting up regions...' : 'Define project regions'}`}
			</button>
		</form>
		{#if errorMessage != ''}
			<p style="color: red">{errorMessage}</p>
		{/if}
		<GoogleMap bind:map bind:loader minZoom={10} initialZoom={14} />
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

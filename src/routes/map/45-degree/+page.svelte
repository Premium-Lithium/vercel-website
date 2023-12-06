<script>
	import { page } from '$app/stores'
	import GoogleMap from '$lib/components/GoogleMap.svelte'
	let map, loader
	let lat = 0
	let lng = 0
	let zoom = 21
	let mapLoaded = false

	const urlParams = $page.url.searchParams
	lat = +(urlParams.get('latitude') || '0')
	lng = +(urlParams.get('longitude') || '0')
	zoom = +(urlParams.get('zoom') || '21')

	$: if (map && !mapLoaded) {
		map.moveCamera({
			center: { lat, lng },
			zoom,
			heading: 0
		})
		map.setOptions({
			mapTypeId: 'satellite'
		})
		map.setTilt(45)
		mapLoaded = true
	}
</script>

<div class="container">
	<GoogleMap bind:map bind:loader minZoom={9} initialZoom={18} />
</div>

<style>
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
</style>

<script>
	import { PUBLIC_GOOGLE_API_KEY } from '$env/static/public'
	import { onDestroy, onMount } from 'svelte'

	import Magnifier from './Magnifier.svelte'
	export let loader = null
	export let cypressTag = ''
	export let map
	export let initialZoom
	export let minZoom
	export let initialCenter
	export let mapId

	export let magnifierOutline = '#ffffff'
	let CONTROL_POSITION
	let eventManager
	let mapWidth, mapHeight
	export let magnifierDisabled = true
	let [boundsChangedListener, idleListener, dragEndListener] = [false, false, false]
	let staticMapImage = ''
	$: {
		if (mapWidth * mapHeight) staticMapImage = getStaticImage()
	}

	onMount(async () => {
		const Loader = await import('@googlemaps/js-api-loader')
		loader = new Loader.Loader({
			apiKey: PUBLIC_GOOGLE_API_KEY,
			version: 'weekly',
			libraries: ['places']
		})
		const mapOptions = {
			center: initialCenter
				? initialCenter
				: {
						lat: 53.95922,
						lng: -1.0761
				  },
			zoom: initialZoom,
			zoomControl: false,
			zoomControlOptions: {
				position: CONTROL_POSITION
			},
			minZoom,
			disableDefaultUI: true,
			tilt: 0,
			// mapTypeId: mapId: 'hybrid',
			disableDoubleClickZoom: true,
			mapId: mapId ? mapId : '6f6816d6bb1eeac4',
			draggableCursor: 'pointer'
		}
		if (!(mapId)) {
			mapOptions['mapTypeId'] = 'hybrid'
		}
		magnifierDisabled = true
		loader
			.importLibrary('core')
			.then((c) => {
				const { event, ControlPosition } = c
				eventManager = event
				CONTROL_POSITION = ControlPosition.TOP_RIGHT
			})
			.then(() => {
				if (!map) {
					loader
						.importLibrary('maps')
						.then(async ({ Map }) => {
							map = new Map(document.getElementById('map'), mapOptions)
						})
						.catch((e) => {
							// do something
						})
				} else {
					let mapNode = map.getDiv()
					document.getElementById('map')?.appendChild(mapNode)
					magnifierDisabled = true

					map.addListener('bounds_changed', () => {
						boundsChangedListener = true
					})

					map.addListener('dragend', () => {
						dragEndListener = true
						staticMapImage = getStaticImage()
					})

					map.addListener('idle', () => {
						idleListener = true
						staticMapImage = getStaticImage()
					})
				}
			})
	})

	onDestroy(() => {
		if (idleListener) google.maps.event.clearListeners(map, 'idle')
		if (dragEndListener) google.maps.event.clearListeners(map, 'dragend')
		if (boundsChangedListener) google.maps.event.clearListeners(map, 'bounds_changed')
	})

	function getStaticImage() {
		if (!map) return
		return `https://maps.googleapis.com/maps/api/staticmap?center=${map.getCenter().lat()},${map
			.getCenter()
			.lng()}&size=${Math.floor(mapWidth / 4)}x${Math.floor(mapHeight / 4)}&zoom=${
			map.getZoom() - 2
		}&maptype=satellite&scale=2&key=${PUBLIC_GOOGLE_API_KEY}`
	}
</script>

<Magnifier
	bind:src={staticMapImage}
	mgMouseOffsetX="-75"
	mgMouseOffsetY="-75"
	mgTouchOffsetY="-75"
	mgTouchOffsetX="-75"
	bind:disabled={magnifierDisabled}
	bind:outlineColor={magnifierOutline}
	><div
		data-cy={cypressTag}
		id="map"
		bind:clientWidth={mapWidth}
		bind:clientHeight={mapHeight}
	/></Magnifier
>

<style lang="scss">
	#map {
		width: 100%;
		height: 100%;
	}
	#map :global(button[title='Undo last edit']) {
		display: none !important;
	}

	#map :global(.gm-style-moc) {
		background-color: rgba(0, 0, 0, 0.1);
	}
</style>

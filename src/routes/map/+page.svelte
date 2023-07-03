<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
</svelte:head>

<script>
import { onMount } from 'svelte';

onMount(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXZhbi1zbm9zd2VsbCIsImEiOiJjbGlhNnk3dzEwMHFzM21xcGhqNmptbTl4In0.pNl0nyJWFKR9Nrxi2b_mJA';
        const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-1.1629912,53.9585683],// starting position [lng, lat]
        zoom: 5, // starting zoom
        });

    const marker1 = new mapboxgl.Marker({color: 'red'})
            .setLngLat([12.554729, 55.70651])
            .addTo(map);
});

</script>

<div id="map" style="width: 100%; height: 400px;"></div>

<style>
</style>

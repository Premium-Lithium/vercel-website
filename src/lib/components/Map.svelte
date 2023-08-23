<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'></script>
    <script id='search.js' defer src='https://api.mapbox.com/search-js/v1.0.0-beta.17/web.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>

<script>

import { onMount } from 'svelte';

onMount(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
        zoom: 5 // zoom level
    });

    map.on('load', async () => {
    });
});

</script>

<div id="map" ></div>

<style>
    #map{
        width: 25vw;
        height: 25vh;
    }
    
</style>
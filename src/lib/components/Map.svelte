<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" type="text/css">
</svelte:head>

<script>

import { onMount } from 'svelte';
onMount(() => {
    const mapboxGlAccessToken = 'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
    mapboxgl.accessToken = mapboxGlAccessToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
        center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
        zoom: 5 // zoom level
    });

    map.on('load', async () => {
        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxGlAccessToken,
                mapboxgl: mapboxgl,
                flyTo: {
                    speed: 2.5,
                },
            }),
        );
        map.resize();
    });
});

</script>

<div id="map"></div>

<style>
    #map{
        width: 100%;
        height: 100%;
    }
    
</style>
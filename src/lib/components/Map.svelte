<svelte:head>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" type="text/css">
</svelte:head>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
export let search = true;
export let map = undefined;
export let searchResult = {'latitude': undefined, 'longitude': undefined};
const styles = [
    'mapbox://styles/mapbox/streets-v12',           // 0
    'mapbox://styles/mapbox/outdoors-v12',          // 1
    'mapbox://styles/mapbox/light-v11',             // 2
    'mapbox://styles/mapbox/dark-v11',              // 3
    'mapbox://styles/mapbox/satellite-v9',          // 4
    'mapbox://styles/mapbox/satellite-streets-v12', // 5
    'mapbox://styles/mapbox/navigation-day-v1',     // 6
    'mapbox://styles/mapbox/navigation-night-v1']   // 7

export let style = 5;
import { onMount } from 'svelte';
onMount(() => {
    const mapboxGlAccessToken = 'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
    mapboxgl.accessToken = mapboxGlAccessToken;
    map = new mapboxgl.Map({
        container: 'map',
        style: styles[style],
        center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
        zoom: 5 // zoom level
    });

    map.on('load', async () => {
        if(search){
            const search = new MapboxGeocoder({
                accessToken: mapboxGlAccessToken,
                mapboxgl: mapboxgl,
                flyTo: {
                    speed: 2.5,
                },
            });
            search.on('result', (e) => {
                searchResult.latitude = e.result.geometry.coordinates[1];
                searchResult.longitude = e.result.geometry.coordinates[0];
            })
            map.addControl(
                search,
            );
        }
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
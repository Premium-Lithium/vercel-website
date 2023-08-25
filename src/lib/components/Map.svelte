<script>
export let search = true;
export let map = undefined;
const styles = [
    'mapbox://styles/mapbox/streets-v12',
    'mapbox://styles/mapbox/outdoors-v12',
    'mapbox://styles/mapbox/light-v11',
    'mapbox://styles/mapbox/dark-v11',
    'mapbox://styles/mapbox/satellite-v9',
    'mapbox://styles/mapbox/satellite-streets-v12',
    'mapbox://styles/mapbox/navigation-day-v1',
    'mapbox://styles/mapbox/navigation-day-v1',
    'mapbox://styles/mapbox/navigation-night-v1']

export let style = 5;
export let searchedLocation = undefined;

import { onMount } from 'svelte';
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

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
            map.addControl(
                new MapboxGeocoder({
                    accessToken: mapboxGlAccessToken,
                    mapboxgl: mapboxgl,
                    flyTo: {
                        speed: 2.5,
                    },
                }).on("result", (selected) => {
                    searchedLocation = selected.result.place_name
                }),
            );
        }
        map.resize();
    });
});

</script>

<div id="map"></div>

<style>
    @import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
    @import 'mapbox-gl/dist/mapbox-gl.css';

    #map{
        width: 100%;
        height: 100%;
    }
    
</style>

<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>

<script>
import { onMount } from 'svelte';

onMount(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
    console.log(mapboxgl.accessToken);

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
        zoom: 5 // zoom level
    });

    async function fetchLocationData() {
        const response = await fetch('https://api.pipedrive.com/api/v1/organizations?filter_id=115&api_token=77a5356773f422eb97c617fd7c37ee526da11851', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        const data = await response.json();

        // Remove any postcodes that are null
        const filteredData = data.data.filter(item => item.address_postal_code !== null);
        const postcodes = filteredData.map(item => item.address_postal_code);
        const names = {};

        filteredData.forEach(item => {
            names[item.address_postal_code] = item.name;
        });

        const postcodeResponse = await fetch('https://api.postcodes.io/postcodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "postcodes": postcodes })
        });

        const postcodeData = await postcodeResponse.json();
        const filteredPostcodeData = postcodeData.result.filter(item => item.result !== null);
        const output = {};

        filteredPostcodeData.forEach(item => {
            output[item.query] = {
                latitude: item.result.latitude,
                longitude: item.result.longitude,
                name: names[item.query]
            };
        });

        return output;
    }

    async function getLatLonsFromPostcodes(postcodes) {

    }


    // Colors for the markers
    const colors = ["white", "gray", "green"];

    map.on('load', () => {
        fetchLocationData().then(data => {
            for(let postcode in data) {
                const marker = new mapboxgl.Marker({ color: colors[Math.floor(Math.random() * colors.length)] })
                    .setLngLat([data[postcode].longitude, data[postcode].latitude])
                    .addTo(map);

                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setText(data[postcode].name);

                marker.setPopup(popup); // Associate the popup with the marker

                // add mouseenter event to marker
                marker.getElement().addEventListener('mouseenter', () => marker.togglePopup());
                // add mouseleave event to marker
                marker.getElement().addEventListener('mouseleave', () => marker.togglePopup());
            }
        });
    });
<div id="map" style="width: 100%; height: 100vh;"></div>


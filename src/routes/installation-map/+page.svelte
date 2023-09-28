<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { latLongOfMarker } from '$lib/MapStores';
	import { onMount } from 'svelte';
	let map;
	let mapZoom = 4;
	let style = 5;

	// Completely necessary function
	function changeStyle() {
		console.log(style);
		style = style % 7;
		style += 1;
	}
	let addresses = [
		'Hillcrest farm, Scottshill, Outwood, Surrey, RH1 5PR',
		'Quartz Point, 13 The Stonebow, York YO1 7NP'
	];

	const API_TOKEN =
		'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';
	async function fetchLatlonFromAddress(address) {
		try {
			const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${API_TOKEN}`;
			const geocodingResponse = await fetch(endpoint);
			if (geocodingResponse.ok) {
				const data = await geocodingResponse.json();
				const latLong = {
					latitude: data.features[0].geometry.coordinates[1],
					longitude: data.features[0].geometry.coordinates[0]
				};
				return latLong;
			} else {
				console.error('Bad Response');
			}
		} catch (error) {
			console.error('Bad Catch');
		}
	}
    
    let latLongArr = [];
    const phase = ["Project Handover", "Awaiting Site Survey", "Site Survey Confirmed", "Site Survey Completed", "DNO Application", "Pre-Installation", "Installation Confirmed"]
    const colorcode = ["red", "orange", "blue", "green", "yellow", "cyan", "purple"]
    const projectData = [
        {
            name: "Bob Powell",
            phase: "Project Handover",
            address: "Chewton Mendip, Radstock BA3 4PF, UK", //to get long lat
        },
        {
            name: "Sundip Nagar",
            phase: "DNO Application",
            address: "35 St Francis Cl, Penenden Heath, Maidstone, UK",
        },
        {
            name: "Patrick Macintosh",
            phase: "Pre-Installation",
            address: "Hillcrest farm, Scottshill, Outwood, Surrey, RH1 5PR",
        }
    ];

    const markersData = [];
    console.log(projectData)
    function GetLatLongsFromData(data){
        let markers = [];
        for(let i in data){
            let latlong = fetchLatlonFromAddress(data[i].address);
            
            latlong.then((value) => {
                markers.push(value)
            });
            
        }
        console.log(markers)
    }
    GetLatLongsFromData(projectData)
    

</script>

<body>
    <div class="grid-container">
        <div class="grid-item">
            <h1>Installation Map</h1>
            <div class="filter-container">
                <div>Filters</div>
                <div>Installation Date</div>
                <ul>
                    <li>
                        <input type="checkbox" id=""><span>Project Handover</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>Awaiting Site Survey</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>Site Survey Confirmed</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>Site Survey Completed</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>DNO Application</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>Pre-Installation</span>
                    </li>
                    <li>
                        <input type="checkbox" id=""><span>Installation Confirmed</span>
                    </li>
                </ul>
                
            </div>
            <div class="details">
                <div>
                    <div>
                        Name
                    </div>
                    <div>
                        etc
                    </div>
                </div>
            </div>
        </div>
        <div class="grid-item">
            <div class="map-view">
                {#key style}
                    <Map
                        search={false}
                        bind:style
                        bind:map
                        zoom={mapZoom}
                        --border-radius="10px"
                        markerArr={latLongArr}
                    />
                {/key}
            </div>
            <div id="styleButton">
                <button on:click={changeStyle}>Change Style</button>
            </div>
        </div>
    </div>
	
</body>
<style>
    body {
        color: #fff;
    }
	.map-view {
		width: 100%;
		height: 80vh;
	}
    .grid-container {
        display: grid;
        grid-template-columns: auto 70%;
    }
    .grid-item {
        background: #091408;
        padding: 20px;
        height: 100vh;
    }
    .filter-container ul {
        list-style: none;
        float: left;
    }
</style>

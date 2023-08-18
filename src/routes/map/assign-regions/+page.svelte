<svelte:head>
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>


<script>
import { onMount } from 'svelte';
import fetchAllPaginated from '$lib/pipedrive/fetchAllPaginated';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import '@turf/points-within-polygon';
import { featureCollection, point, polygon } from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { supabase } from '$lib/supabase';

const DB_NAME = "installation-manager-regions";
let markerIdList = [];
let polygons = [];
let installationManagerDetails = [];
let jobsToBeAssigned = [];
let draw;

const loadPolygonsFromDatabase = async (map) => {
    let {data, error} = await supabase.from(DB_NAME).select('*');
    if(!data || error) {
        return;
    }
    data.forEach(x => {
        installationManagerDetails.push({"id": x.id, "name": x.name})
        if(x.latlong) {
            let p = polygon([deserializeCoordinates(x.latlong)])
            polygons.push(p);
            map.addSource(`polygon-${x.id}`, {
                "type": "geojson",
                "data": {
                    "type": p.type,
                    "geometry": p.geometry,
                },
            });
        }
    });
}

const serializeCoordinates = (coords) => {
    return coords.reduce(
        (acc, cv, ci, arr) => {
            return `${acc}${ci === 0 ? '' : ','}${cv[0].toString()},${cv[1].toString()}`;
        }, ""
    )
}

const deserializeCoordinates = (coordString) => {
    let coordSplit = coordString.split(',').map(x => parseFloat(x));
    let coords = [];
    for(let i = 0; i < coordSplit.length; i+=2) {
        coords.push([coordSplit[i], coordSplit[i+1]]);
    }
    return coords;
}

onMount(async () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGV3aXNib3dlcyIsImEiOiJjbGppa2MycW0wMWRnM3Fwam1veTBsYXd1In0.Xji31Ii0B9Y1Sibc-80Y7g';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-3.435973, 55.378051], // longitude and latitude of the center of the UK
        zoom: 5 // zoom level
    });


    function splitArrayIntoNLengthChunks(inputArray, n) {
        return inputArray.reduce((all,one,i) => {
            const ch = Math.floor(i/n); 
            all[ch] = [].concat((all[ch]||[]),one); 
            return all
        }, [])
    }

    async function fetchLatlonFromPostcodesPostcodes(postcodes) {
        const postcodeChunks = splitArrayIntoNLengthChunks(postcodes, 90);
        const locationChunks = await Promise.all(postcodeChunks.map(async (postcodeChunk) => {
            const postcodeResponse = await fetch('https://api.postcodes.io/postcodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "postcodes": postcodeChunk })
            });

            const postcodeData = await postcodeResponse.json();
            const filteredPostcodeData = postcodeData.result.filter(item => item.result !== null);
            return filteredPostcodeData

        }));

        return locationChunks.reduce((x, y) => x.concat(y));
    }

    async function fetchInstallerData() {
        const data = await fetchAllPaginated({
            url: 'https://api.pipedrive.com/api/v1/organizations',
            queryParams: ['filter_id=115', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851'],
        })


        // Remove any postcodes that are null
        const filteredData = data.filter(item => item.address_postal_code !== null);
        const postcodes = filteredData.map(item => item.address_postal_code).slice(90)
        const locationData = await fetchLatlonFromPostcodesPostcodes(postcodes)


        // Match installer data with postcode data

        return locationData.map((data) => {
            const postcode = data.query;
            const correspondingDatum = filteredData.find((x) => x.address_postal_code === postcode);
            return {
                ...correspondingDatum,
                ...data.result,
                type: "installer",
            };
        }) 
    }

    
    //const postcodeIndex = '80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code'
    const postcodeIndex = 'd09ae1ac084a1afd7ddd515c520a36f568390b54';
    async function fetchJobData() {
        const data = await fetchAllPaginated({
            url: 'https://api.pipedrive.com/api/v1/deals',
            //queryParams: ['filter_id=55', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851'],
            queryParams: ['filter_id=142', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851'],
        })


        const filteredData = data.filter(item => item[postcodeIndex] !== null);
        const postcodes = filteredData.map(item => item[postcodeIndex]).slice(0)
        const locationData = await fetchLatlonFromPostcodesPostcodes(postcodes);


        // Match job data with postcode data

        return locationData.map((data) => {
            const postcode = data.query;
            const correspondingDatum = filteredData.find((x) => x[postcodeIndex] === postcode);
            return {
                ...correspondingDatum,
                ...data.result,
                name: correspondingDatum.title,
                type: "job",
            };
        }) 
    }


    // Colors for the markers
    const colors = ["white", "gray", "green"];
    const colouringFunction = (data) => {
        if (data.type === "job") return "blue";
        if (data.type === "installer") return "green";
        return "red";
    }

    map.on('load', async () => {
        //const installerData = await fetchInstallerData()
        const data = await fetchJobData()
        //const data = jobData.concat(installerData)
        for(let postcode in data) {
            const marker = new mapboxgl.Marker({ color: colouringFunction(data[postcode]) })
                .setLngLat([data[postcode].longitude, data[postcode].latitude])
                .addTo(map);
            markerIdList.push({"marker": marker, "id": data[postcode].id});

            const popup = new mapboxgl.Popup({ offset: 25 })
                .setText(data[postcode].name);

            marker.setPopup(popup); // Associate the popup with the marker

            // add mouseenter event to marker
            marker.getElement().addEventListener('mouseenter', () => marker.togglePopup());
            // add mouseleave event to marker
            marker.getElement().addEventListener('mouseleave', () => marker.togglePopup());
        }
        await loadPolygonsFromDatabase(map);
        draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true,
            },
        });
        addHomeButton(map);
        map.addControl(draw, 'top-left');
        addSaveButton(map);
        addSyncButton(map);
        map.on('draw.update', updatePolygonCoordinates);
        map.on('draw.create', updatePolygonCoordinates);
        map.on('draw.delete', updatePolygonCoordinates);
        
        draw.add(polygons[0]);        
    });
    const updatePolygonCoordinates = () => {
        jobsToBeAssigned = [];
        polygons = draw.getAll().features;
        let pointMarkerList = markerIdList.map(m => { return {"marker": m.marker, "point": point(m.marker.getLngLat().toArray())}});
        let points = featureCollection(pointMarkerList.map(obj => obj.point));
        polygons.forEach((currentElement, index, arr) => {
            const poly = currentElement;
            const pointsInside = pointsWithinPolygon(points,poly).features;
            pointsInside.forEach(point => {
                let p = pointMarkerList.find(obj => obj.point.geometry.coordinates[0] === point.geometry.coordinates[0] && obj.point.geometry.coordinates[1] === point.geometry.coordinates[1]).marker;
                let dealId = markerIdList.find(obj => obj.marker === p).id;
                jobsToBeAssigned.push({"dealId": dealId, "installerManagerUserID": installationManagerDetails[index].id});
            });
        });
        let serial = serializeCoordinates(polygons[0].geometry.coordinates[0]);
    }   
    const homePosition = {
        center: [-1.0824345406845737,53.957031087688534],
    };

    function addHomeButton(map) {
        class HomeButton {
            onAdd(map) {
                const div = document.createElement("div");
                div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
                div.innerHTML = `<button>
                    <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" style="font-size: 20px;"><title>Reset map</title><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
                    </button>`;
                div.addEventListener("contextmenu", (e) => e.preventDefault());
                div.addEventListener("click", () => map.flyTo(homePosition));
                return div;
            }
        }
        const homeButton = new HomeButton();
        map.addControl(homeButton, "top-left");
    }

    function addSaveButton(map) {
        class SaveButton {
            onAdd(map) {
                const div = document.createElement("div");
                div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
                div.innerHTML = `
                    <button>
                        <svg focusable="false" height="38" width="38" viewBox="-3 -3 29 29" aria-hidden="true" style="font-size: 20px;">
                            <title>Save regions</title>
                            <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z">
                            </path>
                        </svg>
                    </button>`;
                div.addEventListener("contextmenu", (e) => e.preventDefault());
                div.addEventListener("click", async () => await saveRegionsToDB());
                return div;
            }
        }
        const saveButton = new SaveButton();
        map.addControl(saveButton, "top-left");
    }

    function addSyncButton(map) {
        class SyncButton {
            onAdd(map) {
                const div = document.createElement("div");
                div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
                div.innerHTML = `
                    <button>
                        <svg focusable="false" height="38" width="38" viewBox="-3 -3 29 29" aria-hidden="true" style="font-size: 20px;">
                            <title>Reassign deals to Installation Managers</title>
                            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                        </svg>
                    </button>`;
                div.addEventListener("contextmenu", (e) => e.preventDefault());
                div.addEventListener("click", async () => await syncJobOwnersToPipedrive());
                return div;
            }
        }
        const syncButton = new SyncButton();
        map.addControl(syncButton, "top-left");
    }

    async function saveRegionsToDB() {
        for(let i = 0; i < polygons.length; i++) {
            await supabase
            .from(DB_NAME)
            .upsert({
                id: installationManagerDetails[i].id,
                name: installationManagerDetails[i].name,
                latlong: serializeCoordinates(polygons[i].geometry.coordinates[0]),
            });
            console.log(`Saved region for ${installationManagerDetails[i].id}`);
        }
    }

    async function syncJobOwnersToPipedrive() {
        // This needs to be ran at time of close, so possibly set up an endpoint with a webhook for this.
        // on deal.update.. if deal.status open -> won.. update owner in pipedrive. 
        updatePolygonCoordinates();
        saveRegionsToDB();
        jobsToBeAssigned.forEach(async x => {
            console.log(`Deal ID: ${x.dealId}, Manager User ID: ${x.installerManagerUserID}`);
            await fetch(`https://api.pipedrive.com/api/v1/deals/${x.dealId}?api_token=77a5356773f422eb97c617fd7c37ee526da11851`, {
                method: 'PUT',
                body: JSON.stringify({'user_id': x.installerManagerUserID}),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        })
    }
});

</script>
<div id="map" style="width: 100%; height: 100vh;"></div>

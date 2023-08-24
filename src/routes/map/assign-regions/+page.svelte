<script>
import { onMount } from 'svelte';
import Map from '$lib/components/Map.svelte';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import pointsWithinPolygon from '@turf/points-within-polygon';
import { featureCollection, point, points, polygon } from '@turf/helpers';
import { supabase } from '$lib/supabase';
import { serializeCoordinates, deserializeCoordinates, fetchLatlonFromPostcodesPostcodes,
         fetchInstallerDataFromPipedrive, fetchJobDataFromPipedrive } from '$lib/mapUtils';


const DB_NAME = "installation-manager-regions";
let markerIdList = [];
let polygons = [];
let installationManagerDetails = [];
let jobsToBeAssigned = [];
let draw;
let idHoveringOver = "";
let map;

var swatchColours = [
      'green',
      'blue',
      'orange',
      'maroon',
      'cyan',
      'red',
      'pink',
      'yellow'

    ];

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


onMount(async () => {
    // Colors for the markers
    const colors = ["white", "gray", "green"];
    const colouringFunction = (data) => {
        if (data.type === "job") return "blue";
        if (data.type === "installer") return "green";
        return "red";
    }

    map.on('load', async () => {
        //const installerData = await fetchInstallerDataFromPipedrive()
        const data = await fetchJobDataFromPipedrive()
        console.log(data);
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
            styles: drawStyles,
            userProperties: true
        });
        addHomeButton(map);
        map.addControl(draw, 'top-left');
        addSaveButton(map);
        //addSyncButton(map);
        map.on('draw.update', updatePolygonCoordinates);
        map.on('draw.create', updatePolygonCoordinates);
        map.on('draw.delete', updatePolygonCoordinates);
        map.on('mousemove', (e) => {
          idHoveringOver = "";
          polygons.forEach((p,i,a) => {
            if(pointsWithinPolygon(points([[e.lngLat.lng, e.lngLat.lat]]),polygon([p.geometry.coordinates[0]])).features.length != 0){  
              idHoveringOver = installationManagerDetails[i].name;
            }
          })
        })
        let i = 0;
        polygons.forEach( x => {
          draw.add(x);
          draw.setFeatureProperty(draw.getAll().features.pop().id, 'myFillColorProperty', swatchColours[i]);
          i++;
        });        
    });
    const updatePolygonCoordinates = (e) => {
        jobsToBeAssigned = [];
        polygons = draw.getAll().features;
        let pointMarkerList = markerIdList.map(m => { return {"marker": m.marker, "point": point(m.marker.getLngLat().toArray())}});
        let points = featureCollection(pointMarkerList.map(obj => obj.point));
        polygons.forEach((currentElement) => {
            if (e && e.features && e.features.length === 1) {
              let polyColour = polygons.findIndex((p) => p.id === e.features[0].id);
              draw.setFeatureProperty(e.features[0].id, 'myFillColorProperty', swatchColours[polyColour]);
            }
            const poly = currentElement;
            const pointsInside = pointsWithinPolygon(points,poly).features;
            pointsInside.forEach(point => {
                let p = pointMarkerList.find(obj => obj.point.geometry.coordinates[0] === point.geometry.coordinates[0] && obj.point.geometry.coordinates[1] === point.geometry.coordinates[1]).marker;
            });
        });
        let serial = serializeCoordinates(polygons[0].geometry.coordinates[0]);
    }   
    // LngLat of York
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
            console.log(`Saved region for ${installationManagerDetails[i].name}`);
        }
    }
});

var drawStyles = [
  {
    'id': 'gl-draw-polygon-fill-inactive',
    'type': 'fill',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'fill-color': {
      	'type': 'identity',
        'property': 'user_myFillColorProperty'
      },
      'fill-outline-color': '#000000',
      'fill-opacity': 0.2
    }
  },
  {
    'id': 'gl-draw-polygon-fill-active',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#000000',
      'line-width': 2,
      'line-opacity': 0.4,
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#3bb2d0',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#3bb2d0'
    }
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint']
    ],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-point-static',
    'type': 'circle',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#404040'
    }
  }
];

</script>
<Map bind:map search:{false}/>
<pre id="info">
  {idHoveringOver}
</pre>

<style>
  #info {
    position: absolute;
    top: 0;
    right: 0;
    margin:20px;
    margin-right:30px;
    font-family: 'Roboto', sans-serif;
    font-size: 18px;
    font-weight: bolder;
  }
</style>



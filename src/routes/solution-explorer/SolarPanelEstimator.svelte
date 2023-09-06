<script>
    import { latLongOfMarker, markersOnMap } from '$lib/MapStores.js';
    import MapboxDraw from "@mapbox/mapbox-gl-draw";
    import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
    import area from '@turf/area';
	import mapboxgl from "mapbox-gl";
	import { onMount } from "svelte";

    export let map;
    let draw;
    $: {
        map?.on('load', () => {
            draw = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        polygon: true,
                        point: true,
                        trash: true,
                    },
                });
            map.addControl(draw, 'top-left');
            
            map.on('draw.modechange', function(event) {
                if(event.mode === "draw_polygon"){
                    // Get all the features drawn so far
                    const allFeatures = draw.getAll();
                    // If there are more than one polygon, remove the oldest one
                    if (allFeatures.features.length > 1) {
                        // Get the id of the first polygon
                        const firstPolygonId = allFeatures.features[0].id;
                        draw.delete(firstPolygonId);
                    }
                }
            });
            map.on('draw.create', drawCreate);
            map.on('draw.update', drawUpdate);
            map.doubleClickZoom.disable();
        });
    }


function drawCreate(event) {
    let features = draw.getAll().features;
    if (features[features.length-1].geometry.type == 'Polygon') logRoofArea();
    else if (features[features.length-1].geometry.type == 'Point') createMarkerFromPoint(features[features.length-1]);
}

function drawUpdate(event) {
    let features = draw.getAll().features;
    if (features[features.length-1].geometry.type == 'Polygon') logRoofArea();
}

function logRoofArea() {
    console.log(`Area of selected roof ${(area(draw.getAll().features[0])).toFixed(2)}m²`);
}

function createMarkerFromPoint(point) {
    $markersOnMap.forEach((m) => m.remove())
    $markersOnMap = [];
    const marker = new mapboxgl.Marker({color: "blue", draggable: true})
    .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
    .addTo(map);
    $latLongOfMarker = {"latitude": point.geometry.coordinates[1], "longitude": point.geometry.coordinates[0]};
    draw.delete(point.id);
    $markersOnMap.push(marker);
    marker.on('dragend', () => {
        $markersOnMap.forEach((m) => {if(m._color != 'blue') m.remove()});
		$markersOnMap.filter((m) => m._color == 'blue');
        let lngLat = marker.getLngLat();
        $latLongOfMarker = {"latitude": lngLat.lat, "longitude": lngLat.lng};
    })
}
</script>



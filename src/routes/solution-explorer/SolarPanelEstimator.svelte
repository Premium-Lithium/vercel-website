<script>
    import MapboxDraw from "@mapbox/mapbox-gl-draw";
    import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
    import area from '@turf/area';
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
            map.on('draw.create', logRoofArea);
            map.on('draw.update', logRoofArea);
        });
}

function logRoofArea() {
    console.log(`Area of selected roof ${(area(draw.getAll().features[0])).toFixed(2)}m²`);
}
</script>


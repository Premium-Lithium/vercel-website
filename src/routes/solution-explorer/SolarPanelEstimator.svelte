<script>
    import MapboxDraw from "@mapbox/mapbox-gl-draw";
    import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
    import area from '@turf/area';
    import { onMount } from "svelte";
    export let map;
    let draw;
    onMount(() => {
    map.on('load', () => {
        draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true,
                },
            });
        map.addControl(draw, 'top-left');
        
        map.on('draw.modechange', function(event) {
        if(event.mode === "draw_polygon"){
            // Get all the features drawn so far
            const allFeatures = draw.getAll();
            // If there are more than one polygonm, remove the oldest one
            if (allFeatures.features.length > 1) {
                // Get the id of the first polygon
                const firstPolygonId = allFeatures.features[0].id;
                draw.delete(firstPolygonId);
            }
        }
        });
        map.on('draw.create', function(event){
        console.log(area(draw.getAll().features[0]));
        });
    });
});
</script>


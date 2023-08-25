<script>
    import Map from "$lib/components/Map.svelte"
</script>

the solar stage

<div>
    Do you already have solar?
</div>

<div class="map-view">
  <Map search={true} style=5/>
</div>

<style>
  @import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
  @import 'mapbox-gl/dist/mapbox-gl.css';

  .map-view {
    width: 100vw;
    height: 25vh;
  }
</style>

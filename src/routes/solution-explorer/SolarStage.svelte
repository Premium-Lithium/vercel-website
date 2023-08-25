<script>
    import Map from "$lib/components/Map.svelte"

    // Question 1
    export let existingSolar;
    export let numberOfPanels
    export let solarTariff

    // Question 2
    export let solarLocation

    let map;
    console.log(map)
</script>

<div>
    <h2>1. Do you already have solar?</h2>
    <label for="yessolar">Yes</label>
    <input
        id="yessolar"
        type="radio"
        name="existingsolar"
        value={true}
        bind:group={existingSolar}
    >
    <label for="nosolar">No</label>
    <input
        id="nosolar"
        type="radio"
        name="existingsolar"
        value={false}
        bind:group={existingSolar}
    >
</div>
{#if existingSolar}
<div>
    <h3>1.1 How many panels do you have?</h3>
    <input type="number" min=0 max=100 bind:value={numberOfPanels}>
</div>
<div>
    <h3>1.2 What type of tariff are you on?</h3>
    <label for="segtariff">SEG</label>
    <input
        id="segtariff"
        type="radio"
        name="tariff"
        value="seg"
        bind:group={solarTariff}
    >
    <label for="fittariff">FIT</label>
    <input
        id="fittariff"
        type="radio"
        name="tariff"
        value="fit"
        bind:group={solarTariff}
    >
    <label for="dontknowtariff">Don't know</label>
    <input
        id="dontknowtariff"
        type="radio"
        name="tariff"
        value="dontknow"
        bind:group={solarTariff}
    >

</div>

{/if}

<h2>2. Locate and highlight the roof for the solar installation</h2>
<div class="map-view">
    <Map
        search={true}
        style=5
        bind:searchedLocation={solarLocation}
        bind:map
    />
</div>

<h2>3. Roof details</h2>
<!-- Do this in 3d? -->

<style>
  .map-view {
    width: 100vw;
    height: 25vh;
  }
</style>

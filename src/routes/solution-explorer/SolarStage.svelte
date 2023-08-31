<script>
    import Map from "$lib/components/Map.svelte"
    import Loading from "$lib/components/Loading.svelte";

    import SolarGenerationBreakdown from "./SolarGenerationBreakdown.svelte";

    // Question 1
    export let existingSolar;
    export let numberOfPanels
    export let solarTariff

    // Question 2
    export let solarLocation

    let map;
    let peakSolarPower = 8.8;
    let solarLoss = 14;
    let solarAngle = 45;
    let solarAzimuth = 0; // 0=south, -90=east, 180=north, 90=west
    let mapboxSearchResult = {"latitude": 53.95924825020342, "longitude":-1.0772513524147558};
    let monthlySolarGenerationValues = [];
    let loadingSolarValues = false;
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

<h2>3. Energy Estimation</h2>
<div class="solar-api">
    <label for="peakSolarPower">Peak Solar Power</label>
          <input type="number" id="peakSolarPower" name="peakSolarPower" bind:value={peakSolarPower}>
          <label for="solarLoss">Solar Loss</label>
          <input type="number" id="solarLoss" name="solarLoss" bind:value={solarLoss}>
          <label for="solarAngle">Solar Panel Angle</label>
          <input type="number" id="solarAngle" name="solarAngle" bind:value={solarAngle}/>
          <label for="solarAzimuth">Solar Panel Azimuth</label>
          <input type="number" id="solarAzimuth" name="solarAzimuth" bind:value={solarAzimuth}/>
          <input type="submit" value="Submit" on:click={async () => {
        monthlySolarGenerationValues = [];
        loadingSolarValues = true;
        let res = await fetch('solution-explorer/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
                body: JSON.stringify({
                'requestType': 'PVGIS',
                'lat': mapboxSearchResult.latitude,
                'lon': mapboxSearchResult.longitude,
                'peakPower': peakSolarPower,
                'loss': solarLoss,
                'angle': solarAngle,
                'azimuth': solarAzimuth,
            })
        });
        res = await res.json();
        loadingSolarValues = false;
        console.log(res);
        res.outputs.monthly.fixed.forEach((x) => {
          monthlySolarGenerationValues = [...monthlySolarGenerationValues, x.E_m];
        })
    }}>
    {#if loadingSolarValues}
    <Loading/>
    {:else}
    <SolarGenerationBreakdown bind:monthlyValues={monthlySolarGenerationValues}/>
    {/if}
</div>

<h2>4. Roof details</h2>

<style>
  .map-view {
    width: 100vw;
    height: 25vh;
  }

  .solar-api {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90vw;
    margin: 20px 5vw;
    
    position: relative;
  }
</style>

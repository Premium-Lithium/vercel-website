<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";

    import ProgressHeader from "./ProgressHeader.svelte"
	  import { calculateUpfrontCost } from './price-configurator';

    let currentPage = 1
    let price =  0; 
    let solution = {houseType: "detatched", solar: true, battery: true, evCharger: {included: true}, usage: "unknown", peopleInHouse: 4, wfh: 0, postcode: "YO10 3LH"};
    onMount(async () => {
        price = calculateUpfrontCost(solution);
    });

</script>

<body>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    <h1> price: £{price[0]} to £{price[1]}</h1>
    <div class="map-view">
      <Map search={true}/>
    </div>
    <h2> currentPage: {currentPage}</h2>
    <NavButtons bind:currentPage lastPage={5}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</body>

<style>
  .map-view {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 25vh;
  }
</style>

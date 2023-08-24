<script>
    import { ssp, queryParam } from "sveltekit-search-params"

    import Map from '$lib/components/Map.svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";
      import { page } from "$app/stores";

    import Solution3DView from './Solution3DView.svelte'
    import ProgressHeader from "./ProgressHeader.svelte"
    import ComponentProps from './ComponentProps.svelte';

    let urlParams;
    $: urlParams = $page.url.searchParams.toString();

    const stage = queryParam("stage", ssp.number())

</script>

<div>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    solution explorer here
</div>
<div>
    <ComponentProps id="testid"/>
    <p>
        {urlParams}
    </p>
</div>
    
    <Solution3DView />
    <div class="map-view">
      <Map search={true}/>
    </div>
    <h2> currentPage: {$stage}</h2>
    <NavButtons bind:currentPage={$stage} lastPage={6}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</body>

<style>
</style>

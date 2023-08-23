<script>
    import { onMount } from 'svelte';
    import Savings from "$lib/components/Savings.svelte";
    import NavButtons from "$lib/components/NavButtons.svelte";

    import ProgressHeader from "./ProgressHeader.svelte"

    onMount(async () => {
    });
    let currentPage = 1
</script>

<div>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    solution explorer here
    <h2> currentPage: {currentPage}</h2>
    <NavButtons bind:currentPage lastPage={5}/>
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</div>

<style>
</style>

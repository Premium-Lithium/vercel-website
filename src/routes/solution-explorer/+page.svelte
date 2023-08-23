<script>
    import { onMount } from 'svelte';
    import Savings from "$lib/components/Savings.svelte";

    onMount(async () => {
    });
</script>

<div>
    solution explorer here
    <Savings totalSavings={10000} paybackTime={5} energySavings={20000}/>
</div>

<style>
</style>
<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';

    onMount(async () => {
    });
</script>

<div class="grid">
    <div class="middle">
        <Map/>
    </div>
    
</div>

<style>
    /* 5 column grid layout, 2 outer padding columns and 3 middle content columns. */
    .grid {
        display: grid;
        width: 100vw;
        height: 100vh;
        grid-template-columns: 0.5fr repeat(3, 1fr) 0.5fr;
        grid-template-rows: repeat(3, 1fr);
        align-items: center;
        justify-items: center;
    }

    .middle {
        grid-column-start: 4;
        grid-row-start: 1;
    }

    
</style>
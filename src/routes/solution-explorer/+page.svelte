<script>
    import { onMount } from 'svelte';
    import Map from '$lib/components/Map.svelte';

    onMount(async () => {
    });
</script>

<body>
    <div class="grid">
        <div class="mid">
            <Map/>
        </div>
    </div>
</body>

<style>
    .grid {
        display: grid;
        height: 100vh; /* Full viewport height */
        width: 100vw; /* Full viewport width */
        grid-template-rows: repeat(3, 1fr);
        grid-template-columns: repeat(3, 1fr);
        align-items: center;
        justify-items: center;
    }

    .mid{
        grid-row: 2; /* Center row */
        grid-column: 2; /* Center column */
        width: 100%;
        height: 100%;
        overflow: none;
    }

</style>
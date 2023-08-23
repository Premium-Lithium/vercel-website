<script>
    import { onMount } from 'svelte';

    import ProgressHeader from "./ProgressHeader.svelte"

    onMount(async () => {
    });
</script>

<div>
    <ProgressHeader
        titles={["first", "second", "third", "fourth", "fifth", "sixth", "seventh"]}
        selectedIndex={6}
    />
    solution explorer here
</div>

<style>
</style>

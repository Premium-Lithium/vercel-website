<script>
    import { onMount } from 'svelte';
    import { page } from "$app/stores";

    import ProgressHeader from "./ProgressHeader.svelte"
    import ComponentProps from './ComponentProps.svelte';

    let urlParams;
    $: urlParams = $page.url.searchParams.toString();

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
<div>
    <ComponentProps id="testid"/>
    <p>
        {urlParams}
    </p>
</div>
    
<style>
</style>

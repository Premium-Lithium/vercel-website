<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
    import {queryParam } from "sveltekit-search-params"

	
    // use component ID as value in store
    export let id;
    const componentParam = queryParam(id);
    
    // navigate to new url
    function inputChanged() {
        goto('?' + $page.url.searchParams.toString(), {noScroll: true, keepFocus:true});
    }

</script>


<input bind:value={$componentParam} on:input={() => inputChanged()}>
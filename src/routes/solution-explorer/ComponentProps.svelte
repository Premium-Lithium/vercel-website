<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
    import {queryParam } from "sveltekit-search-params"

	
    // use component ID as value in store
    export let id;
    export let type;  // component type
    export let text = "";
    export const defaultValue = "";

    console.log(type);
    const componentParam = queryParam(id);
    
    // navigate to new url
    function inputChanged() {
        goto('?' + $page.url.searchParams.toString(), {noScroll: true, keepFocus:true});
    }

    function buttonClicked() {
        if ($componentParam == "true") {
            $componentParam = "false";
        } else if ($componentParam = "false") {
            $componentParam = "true"
        } else {
            console.log("Button not initialised, default to false");
            $componentParam = "false";
        }
    }

</script>

{#if type == "number"}
    <input {id} type="number" bind:value={$componentParam} on:input={() => inputChanged()}>
{:else if type == "toggle"}
    <script>
        // default value
        defaultValue ? $componentParam = defaultValue: $componentParam = "false" ;
        console.log($componentParam);
    </script>
    <button type="button"  class={$componentParam} on:click={() => buttonClicked()}>
        {text}
    </button>
{/if}
<style>
    button[type="button"] {
        background-color: white;
        color: black   
    }
    button.true[type="button"] {
        background-color: black;
        color: white
    }

    button.false[type="button"] {
        background-color: white;
        color: black         
    }
</style>
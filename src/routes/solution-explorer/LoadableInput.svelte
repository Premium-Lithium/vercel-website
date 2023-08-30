<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
    import {queryParam, ssp } from "sveltekit-search-params"

	
    // use component ID as value in store
    export let id;
    export let type;  // component type
    export let text = "";


    console.log(type);
    const componentParam = queryParam(id, ssp.boolean());

    function buttonClicked() {
        if ($componentParam == true) {
            $componentParam = false;
        } else if ($componentParam == false) {
            $componentParam = true
        } else {
            $componentParam = false;
        }
    }

</script>

{#if type == "number"}
    <input {id} type="number" bind:value={$componentParam}>
{:else if type == "toggle"}

    <button type="button"  class={$componentParam ? "true" : "false"} on:click={() => buttonClicked()}>
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
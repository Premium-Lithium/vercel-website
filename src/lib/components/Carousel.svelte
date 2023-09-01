<script lang="ts">
    import Carousel from 'svelte-carousel';
    import { browser } from '$app/environment';
    export let carousel;
    export let infinite = false;
    export let dots = true;
    export let arrows = true;
    export let 
</script>


<div class="carousel-outer">
    {#if browser}
    <Carousel 
    bind:this={carousel}
    bind:infinite
    bind:dots
    bind:arrows
    >
    <slot/>  
    </Carousel>
    {/if}
</div>

<style>
    .carousel-outer {
        display: flex;
        align-items: center;
        width: 80%;
        aspect-ratio: 1;
        margin: 10%;
        border: 1px #e6e6e6 solid;
        border-radius: 10px;
        box-shadow: 0px 0px 14px #bebebe;
    }
</style>
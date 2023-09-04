<script lang="ts">
    import Carousel from 'svelte-carousel';
    import { browser } from '$app/environment';
    export let carousel;
    export let infinite = false;
    export let dots = true;
    export let arrows = true;
</script>

<div class="carousel">
    <div class="slide-container" bind:this={slideContainer}>
        <slot />
    </div>
</div>

<button class="prev-button" on:click={prevSlide}>Previous</button>
<button class="next-button" on:click={nextSlide}>Next</button>

<style>
	.carousel {
		overflow: hidden;
		width: 100%;
		position: relative;
		margin: 0 auto;
	}

	.slide-container {
		display: flex;
        position: relative;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

    .next-button {
        position: absolute;
        right: 25vw;
    }
    .prev-button {
        position: absolute;
        left: 25vw;
    }
</style>

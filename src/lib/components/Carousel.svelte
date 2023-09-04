<script>
	import { onMount, tick } from 'svelte';
	let slideContainer;
	let currentIndex = 0;
	let totalSlides = 0;
	let slides = [];

	onMount(async () => {
		await tick(); // Wait for the DOM to be updated
		slides = Array.from(slideContainer.children);
		totalSlides = slides.length;
		updateSlides();
	});

	export function updateSlides() {
        let slideWidth = '80vw';
        let slidePadding = `calc((100vw - ${slideWidth}) / 4)`
		slides.forEach((slide, index) => {
		    slide.style.opacity = index === currentIndex ? 1 : 0.5;
            slide.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)`;
            slide.style.width = slideWidth;

            if (index == 0)
            slide.style.margin = `${slidePadding} calc(${slidePadding}/2) ${slidePadding} calc(${slidePadding}*2)`
            else if (index == totalSlides-1)
            slide.style.margin = `${slidePadding} calc(${slidePadding}*2) ${slidePadding} calc(${slidePadding}/2)`
            else
            slide.style.margin = `${slidePadding} calc(${slidePadding}/2) ${slidePadding} calc(${slidePadding}/2)`

            slide.style.boxShadow = `0px 2px 8px rgba(180,180,180,.9)`;
            slide.style.borderRadius = `10px`;
            slide.style.padding = `10px`;
		});

        slideContainer.style.transform = `translateX(calc(${currentIndex} * -${slideWidth}))`
        slideContainer.style.width = `calc(${totalSlides} * ${slideWidth} + (calc(${totalSlides} + 1) * ${slidePadding}`


	}

	function nextSlide() {
		if (currentIndex < totalSlides - 1) {
			currentIndex++;
			updateSlides();
		}
	}

	function prevSlide() {
		if (currentIndex > 0) {
			currentIndex--;
			updateSlides();
		}
	}
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

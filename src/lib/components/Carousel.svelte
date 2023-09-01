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

	function updateSlides() {
		slides.forEach((slide, index) => {
		    slide.style.opacity = index === currentIndex ? 1 : 0.25;
            slide.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)`;
            slide.style.width = `80vw`
            slide.style.margin = index == 0 ? `5vw 2.5vw 5vw 10vw` : index == totalSlides-1 ? `5vw 10vw 5vw 2.5vw` : `5vw 2.5vw 5vw 2.5vw`;
            slide.style.border = `2px solid #e1e1e1`;
            slide.style.boxShadow = `0px 0px 8px rgba(111,111,111,.5)`
		});

        slideContainer.style.transform = `translateX(calc(${currentIndex} * -80vw))`
        slideContainer.style.width = `calc(${totalSlides} * 80vw + (calc(${totalSlides} + 1) * 5vw`


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

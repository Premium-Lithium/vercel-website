<script>
	import { onMount} from 'svelte';
    import { send, receive } from './transition.js';
	let slideContainer;
	export let currentIndex = 0;
	let totalSlides = 0;
	let slides = [];
    let startX = 0;

	onMount(async () => {
		// await tick(); // Wait for the DOM to be updated
		slides = Array.from(slideContainer.children);
		totalSlides = slides.length;
		updateSlides();
	});

	function updateSlides() {
        let slideWidth = '80vw';
        let slidePadding = `5vw`
		slides.forEach((slide, index) => {
		    slide.style.opacity = index === currentIndex ? 1 : 0.5;
            slide.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)`;
            slide.style.width = slideWidth;
            slide.style.height = slideWidth;

            if (index == 0)                  slide.style.margin = `calc(${slidePadding}/2) calc(${slidePadding}/2) calc(${slidePadding}/4) calc(${slidePadding}*2)`
            else if (index == totalSlides-1) slide.style.margin = `calc(${slidePadding}/2) calc(${slidePadding}*2) calc(${slidePadding}/4) calc(${slidePadding}/2)`
            else                             slide.style.margin = `calc(${slidePadding}/2) calc(${slidePadding}/2) calc(${slidePadding}/4) calc(${slidePadding}/2)`

            slide.style.boxShadow = `0px 2px 8px rgba(180,180,180,.9)`;
            slide.style.borderRadius = `10px`;
		});

        slideContainer.style.transform = `translateX(calc(${currentIndex} * -1 * ${slideWidth} + ${currentIndex} * -0.5 * ${slidePadding}))`;
        slideContainer.style.width = `calc(${totalSlides} * ${slideWidth} + (${totalSlides} + 1) * ${slidePadding})`;

	}

	export function nextSlide() {
		if (currentIndex < totalSlides - 1) {
			currentIndex++;
			updateSlides();
		}
	}

	export function prevSlide() {
		if (currentIndex > 0) {
			currentIndex--;
			updateSlides();
		}
	}

    function handleTouchStart(event) {
        startX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
        const endX = event.changedTouches[0].clientX;
        const distance = endX - startX;

        // Change this threshold as needed
        const swipeThreshold = 100;

        if (distance > swipeThreshold) {
            prevSlide();
        } else if (distance < -swipeThreshold) {
            nextSlide();
        }
    }
</script>

<div class="carousel"
    on:touchstart={handleTouchStart} 
    on:touchend={handleTouchEnd}>
    <div class="slide-container" bind:this={slideContainer}>
        <slot />
    </div>
    <div class="dots-container">
        {#each [...Array(slides.length)].keys() as s}
        <span class={`${s == currentIndex ? "dot highlighted" : "dot"}`}></span>
        {/each}
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

    .dots-container {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
    }

    .highlighted {
        background-color: var(--plblue);
        transition: background-color 0.2s ease;
    }

    .dot {
        height: 10px;
        width: 10px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.3);
        transition: background-color 0.2s ease;
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

<script>
	import { onMount} from 'svelte';
    import ChevronRight from "svelte-material-icons/ChevronRight.svelte"
    import ChevronLeft from "svelte-material-icons/ChevronLeft.svelte"

	export let currentIndex = 0;

	let slideContainer;
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
        let maxSlideWidth = `40vh`;
        let slideWidth = `calc(min(80vw, ${maxSlideWidth}))`;
        let spaceBetweenSlides = `calc((100vw - ${slideWidth})/4)`
        let slideTopBottomMargin = '20px';
		slides.forEach((slide, index) => {
		    slide.style.opacity = index === currentIndex ? 1 : 0.5;
            slide.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)`;
            slide.style.width = slideWidth;
            slide.style.height = slideWidth;

            if (index == 0)                  slide.style.margin = `${slideTopBottomMargin} calc(${spaceBetweenSlides}/2) ${slideTopBottomMargin} calc(${spaceBetweenSlides}*2)`
            else if (index == totalSlides-1) slide.style.margin = `${slideTopBottomMargin} calc(${spaceBetweenSlides}*2) ${slideTopBottomMargin} calc(${spaceBetweenSlides}/2)`
            else                             slide.style.margin = `${slideTopBottomMargin} calc(${spaceBetweenSlides}/2) ${slideTopBottomMargin} calc(${spaceBetweenSlides}/2)`

            slide.style.boxShadow = `0px 5px 5px rgba(180,180,180,.9)`;
            slide.style.borderRadius = `10px`;
		});

        slideContainer.style.transform = `translateX(calc(${currentIndex} * -1 * ${slideWidth} - ${currentIndex} * ${spaceBetweenSlides}))`;
        slideContainer.style.width = `calc(${totalSlides} * ${slideWidth} + (${totalSlides} + 3) * ${spaceBetweenSlides})`;

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

    <div class="overlay">
        <div class="carousel"
            on:touchstart={handleTouchStart} 
            on:touchend={handleTouchEnd}
        >
            <div class="slide-container" bind:this={slideContainer}>
                <slot />
            </div>
        </div>

        <button class="prev-button" on:click={prevSlide}>
            <ChevronLeft size="4rem"/>
        </button>
        <button class="next-button" on:click={nextSlide}>
            <ChevronRight size="4rem"/>
        </button>
    </div>
    <div class="dots-container">
        {#each [...Array(slides.length)].keys() as s}
        <span class={`${s == currentIndex ? "dot highlighted" : "dot"}`}></span>
        {/each}
    </div>

<style>
    .overlay {
        position: relative;
    }

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

    .dot {
        height: 10px;
        width: 10px;
        background-color: #e5e5e5;
        border-radius: 50%;
        border: 0px solid rgba(0,0,0,0.3);
        transition: background-color 0.2s ease;
        margin: .2rem;
    }

    .highlighted {
        background-color: var(--plblue);
        transition: background-color 0.2s ease;
    }

    .next-button {
        position: absolute;
        top: 50%;
        right:0%;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        border: none;
        background: white;
        border-radius: 100%;
        height: 4rem;
        width: 4rem;
        transform: translate(0, -50%);
        box-shadow: 0px 3px 3px 3px rgba(0,0,0,0.3);
    }

    .prev-button {
        position: absolute;
        top: 50%;
        left:0%;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        border: none;
        background: white;
        border-radius: 100%;
        height: 4rem;
        width: 4rem;
        transform: translate(0, -50%);
        box-shadow: 0px 3px 3px 3px rgba(0,0,0,0.3);
    }
    
    .slide-container > div {
        color: red;
    }
</style>

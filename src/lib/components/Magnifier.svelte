<!-- All credits go to https://github.com/ambarvm/svelte-magnifier
Most of the code is from there, this is just a more general version
which doesn't rely on an image being rendered in the DOM -->

<script lang="ts">
	let img: HTMLElement, // Changed from HTMLImageElement
		imgBounds: DOMRect,
		showZoom = false,
		mgOffsetX = 0,
		mgOffsetY = 0,
		relX = 0,
		relY = 0

	// Removed `src` and `alt` as they're not used anymore
	export let width = '100%',
		src = '',
		height = 'auto',
		className = '',
		zoomImgSrc = '',
		zoomFactor = 1.5,
		mgWidth = 150,
		mgHeight = 150,
		mgBorderWidth = 2,
		mgShape: 'circle' | 'square' = 'circle',
		mgShowOverflow = true,
		mgMouseOffsetX = 0,
		mgMouseOffsetY = 0,
		mgTouchOffsetX = -75,
		mgTouchOffsetY = -75,
		disabled = false,
		outlineColor = '#ffffff'

	const calcImgBounds = () => {
		if (img) {
			imgBounds = img.getBoundingClientRect()
		}
	}

	const onMouseMove = (e: MouseEvent) => {
		if (imgBounds && !disabled) {
			const target = e.target as HTMLElement
			relX = (e.clientX - imgBounds.left) / target.clientWidth
			relY = (e.clientY - imgBounds.top) / target.clientHeight
			mgOffsetX = mgMouseOffsetX
			mgOffsetY = mgMouseOffsetY
			showZoom = true
		}
	}

	const onTouchMove = (e: TouchEvent) => {
		if (imgBounds && !disabled) {
			const target = e.target as HTMLElement
			const _relX = (e.targetTouches[0].clientX - imgBounds.left) / target.clientWidth
			const _relY = (e.targetTouches[0].clientY - imgBounds.top) / target.clientHeight

			// Only show magnifying glass if touch is inside image
			if (_relX >= 0 && _relY >= 0 && _relX <= 1 && _relY <= 1) {
				mgOffsetX = mgTouchOffsetX
				mgOffsetY = mgTouchOffsetY
				relX = _relX
				relY = _relY
				showZoom = true
			} else {
				showZoom = false
			}
		}
	}
</script>

<div
	class="magnifier {className}"
	class:no-overflow={mgShowOverflow}
	style="width: {width}; height: {height}"
>
	<div
		class="content-wrapper"
		bind:this={img}
		on:load={calcImgBounds}
		on:mouseenter={calcImgBounds}
		on:touchstart|preventDefault={calcImgBounds}
		on:mousemove={onMouseMove}
		on:touchmove={onTouchMove}
		on:mouseout={() => (showZoom = false)}
		on:touchend={() => (showZoom = false)}
	>
		<slot />
		<!-- Slot for arbitrary content -->
	</div>
	{#if imgBounds}
		{#key zoomImgSrc || src}
			<div
				class="magnifying-glass"
				class:visible={showZoom && !disabled}
				class:circle={mgShape === 'circle'}
				style="width: {mgWidth}px;
				height: {mgHeight}px;
				left: calc({relX * 100}% - {mgWidth / 2}px + {mgOffsetX}px - {mgBorderWidth}px);
				top: calc({relY * 100}% - {mgHeight / 2}px + {mgOffsetY}px - {mgBorderWidth}px);
				background-image: url('{zoomImgSrc || src}');
				background-position: calc({relX * 100}% + {mgWidth / 2}px - {relX * mgWidth}px) calc({relY *
					100}% + {mgHeight / 2}px - {relY * mgWidth}px);
				background-size: {zoomFactor * imgBounds.width}% {zoomFactor * imgBounds.height}%;
				borderWidth: {mgBorderWidth}px; border: solid {outlineColor}"
				data-cy="magnifier"
			>
				<div class="crosshair">
					<div class="horizontal-line" style="border: 2px dashed {outlineColor}" />
					<div class="vertical-line" style="border: 2px dashed {outlineColor}" />
				</div>
			</div>
		{/key}
	{/if}
</div>

<style lang="postcss">
	.magnifier {
		position: relative;
		display: inline-block;
		line-height: 0;
		width: 100%;
		height: 100% !important;
	}

	.magnifier-image {
		cursor: none;
		width: 100%;
		height: 100%;
	}

	.content-wrapper {
		height: 100%;
	}

	.magnifying-glass {
		position: absolute;
		z-index: 1;
		background: rgba(0, 0, 0) no-repeat;
		box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
		opacity: 0;
		transition: opacity 0.2s;
		pointer-events: none;

		&.circle {
			border-radius: 50%;
		}

		&.visible {
			opacity: 1;
		}
	}

	.no-overflow {
		overflow: hidden;
	}

	.crosshair {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.horizontal-line,
	.vertical-line {
		position: absolute;
		background-color: transparent;
		z-index: 1;
	}

	.horizontal-line {
		top: 50%;
		left: 0;
		width: 100%;
		height: 0;
		transform: translateY(-50%);
	}

	.vertical-line {
		top: 0;
		left: 50%;
		width: 0;
		height: 100%;
		transform: translateX(-50%);
	}
</style>

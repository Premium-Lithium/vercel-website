<script>
	import { onMount } from 'svelte'

	export let azimuth = 0
	export let pitch = 0

	let azimuthCanvas
	let pitchCanvas

	onMount(() => {
		drawAzimuth(azimuthCanvas, azimuth)
		drawPitch(pitchCanvas, pitch)
	})

	$: if (azimuthCanvas && pitchCanvas) {
		drawAzimuth(azimuthCanvas, azimuth)
		drawPitch(pitchCanvas, pitch)
	}

	function drawAzimuth(canvas, azimuth) {
		const ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		const centerX = canvas.width / 2
		const centerY = canvas.height / 2

		ctx.save()
		ctx.translate(centerX, centerY)
		ctx.rotate((azimuth * Math.PI) / 180) // Subtract 90 to align north to top

		ctx.beginPath()
		ctx.rect(-10, -30, 60, 20) // Rectangle centered at origin
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(20, -40) // tip of the arrow
		ctx.lineTo(25, -30) // right side
		ctx.lineTo(15, -30) // left side
		ctx.closePath()
		ctx.fill()

		ctx.restore()

		ctx.font = '16px Arial'
		ctx.fillText('Azimuth: ' + azimuth.toFixed(2), 85, 50)
	}

	function drawPitch(canvas, pitch) {
		const ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		const centerX = canvas.width / 2
		const centerY = canvas.height / 2
		const radius = Math.min(centerX, centerY) * 0.6
		const angle = (pitch * Math.PI) / 180

		ctx.beginPath()
		ctx.moveTo(centerX, centerY)
		ctx.lineTo(centerX + radius * Math.cos(angle), centerY - radius * -Math.sin(angle))
		ctx.lineTo(centerX - radius * Math.cos(angle), centerY - radius * -Math.sin(angle))
		ctx.lineTo(centerX, centerY)
		ctx.stroke()

		ctx.font = '16px Arial'
		ctx.fillText('Pitch: ' + pitch.toFixed(2), 100, 50)
	}
</script>

<div class="container">
	<div class="grid-item">
		<canvas bind:this={azimuthCanvas} width="300" height="300" />
	</div>
	<div class="grid-item">
		<canvas bind:this={pitchCanvas} width="300" height="300" />
	</div>
</div>

<style>
	canvas {
		border: 1px solid black;
		margin: 10px;
	}

	.grid-item {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.container {
		display: flex;
		justify-content: space-evenly;
	}
</style>

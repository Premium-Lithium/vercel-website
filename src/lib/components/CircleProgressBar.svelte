<script>
	export let progress;
	let angle = Number(progress)*360;

	const background = `radial-gradient(white 50%, transparent 51%),
    conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
    conic-gradient(blue 0deg, blue 90deg, blue 180deg, blue);`;

	$: cssVarStyles = `--background:${background}`;
</script>

<div id="progress-circle" style={cssVarStyles} /> 
<p>angle {angle}</p>

<style>
	#progress-circle {
		background: var(--background);
		border-radius: 50%;
		width: 120px;
		height: 120px;
		will-change: transform;
	}
</style>

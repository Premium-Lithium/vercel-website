<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'

    let someData;

    onMount(async () => {
    });
</script>

<div class="visualisation-panel">
  <div class="canvas-container">
    <canvas></canvas>
  </div>
</div>

<style>
    .visualisation-panel {
        width: 50vh;
        height: 50vh;
        background-color: white;
        border-radius: 10px;
        border: 1px solid lightgrey;
    }

    .canvas-container {
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
    }

    canvas {
        background-color: black;
        width: 100%;
        height: 100%;
    }
</style>
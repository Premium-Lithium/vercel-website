<script>
  import { onMount, afterUpdate } from 'svelte';
  import Scene from './Scene.svelte'
  import { Canvas } from '@threlte/core'

  let scenePanel;

  // todo: initialise 3d view camera zoom based on available space
  function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    scenePanel.style.width = `${size}px`;
    scenePanel.style.height = `${size}px`;
  }

  onMount(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  });

  afterUpdate(resizeCanvas);
</script>

<div class="canvas-container" bind:this={scenePanel}>
  <Canvas>
    <Scene />
  </Canvas>
</div>

<style>
  .canvas-container {
      position: relative;
      width: 100%;
      height: 100%;
  }

  .canvas-container::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0) 50%, rgba(255, 255, 255, 1) 75%, rgba(255,255,255,1) 100%);
      pointer-events: none; /* Allows interaction with canvas */
  }

</style>

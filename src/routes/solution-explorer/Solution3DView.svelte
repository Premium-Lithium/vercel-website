<script>
  import { onMount, afterUpdate } from 'svelte';
  import Scene from './Scene.svelte'
  import { Canvas } from '@threlte/core'

  let scenePanel;

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

<div class="visualisation-panel" bind:this={scenePanel}>
  <div class="canvas-container">
    <Canvas>
      <Scene />
    </Canvas>
  </div>
</div>

<style>
  .visualisation-panel {
      width: 100%;
      height: 100%;
      background-color: white;
      border-radius: 10px;
      border: 1px solid lightgrey;
  }

  .canvas-container {
      padding: 20px;
      width: calc(100% - 40px);
      height: calc(100% - 40px);
  }
</style>

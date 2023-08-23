<script>
    import Scene from './Scene.svelte'
    import { Canvas } from '@threlte/core'
</script>

<div class="visualisation-panel">
  <div class="canvas-container">
    <Canvas>
        <Scene />
    </Canvas>
  </div>
</div>

<style>
    .visualisation-panel {
        width: 100vw;
        height: 100vw;
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
<script>
    // This component is responsible for providing a complete visualisation of the solution model.

    import { onMount, tick, afterUpdate } from 'svelte';
    import { writable } from 'svelte/store';
    import Scene from './Scene.svelte'
    import { T } from '@threlte/core'
    import { Canvas } from '@threlte/core'
    import { Theatre, SheetObject } from '@threlte/theatre'
	import Accordian from '$lib/components/Accordian.svelte';

    export let model;
    export let camera;
    export let solarVisible;
    export let batteryVisible;
    export let evVisible;

    let scenePanel;
    let canvasInner;

    let sizeStore = writable(0);
    let canvasSize;
    sizeStore.subscribe(value => { canvasSize = value; });

    function resizeCanvas() {
        const newSize = Math.min(scenePanel.offsetWidth, scenePanel.offsetHeight);
        canvasInner.style.width = `${newSize}px`;
        canvasInner.style.height = `${newSize}px`;
        sizeStore.set(newSize); // Update the size
    }

    onMount(async () => {
        window.addEventListener('resize', resizeCanvas);
        await tick();
        resizeCanvas();
    });

    afterUpdate(resizeCanvas);
</script>

<div class="canvas-container" bind:this={scenePanel}>
    <div class="canvas-inner" bind:this={canvasInner}>
        <Canvas>
            <Theatre>
                <SheetObject
                  key="Camera"
                  let:Sync
                >
                    <T.OrthographicCamera
                      makeDefault
                      manualCamera
                    >
                        <Sync
                            zoom
                            position
                            rotation
                        />
                    </T.OrthographicCamera>
                    <Scene
                        canvasSize={canvasSize}
                        bind:model={model}
                        bind:camera={camera}
                        bind:solarVisible
                        bind:batteryVisible
                        bind:evVisible
                    >
                    </Scene>
                </SheetObject>
            </Theatre>
        </Canvas>
    </div>
</div>

<style>
    .canvas-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        height: 100%;
        background: #fff;
    }

    .canvas-inner {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .canvas-inner::after {
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

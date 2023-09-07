<script>
    import { T, useFrame } from '@threlte/core'
    import CustomRenderer from './CustomRenderer.svelte';
    import { OrbitControls } from '@threlte/extras'

    const camZoomToSizeRatio = 120.0 / 1000.0; // Considers fade out size around border of canvas

    export let model;
    export let canvasSize;
    // export let camera;

    export let batteryVisible = true;
    export let evVisible = true;
    export let solarVisible = true;
    export let groundSolarVisible = true;

    let batteryModel;
    const plBlue = "#28AAE2";

    let rotation = [ 0, 0, 0 ];
    const rotSpeed = 0.2;
    useFrame((state, delta) => {
        rotation[1] += delta * rotSpeed;
        // console.log(model.camPos);
    })
</script>

<T.FogExp2 attach="fog" args={['white', 0.015]} />


<T.OrthographicCamera
    zoom={canvasSize * camZoomToSizeRatio}
    position={[5, 3, 5]}
    on:create={({ ref }) => {
        ref.lookAt(0, 1, 0)
    }}
    makeDefault
></T.OrthographicCamera>

<!-- todo: move these into a json configuration file -->
<T.DirectionalLight position={[10, 10, -4]} castShadow intensity={1.5} scale={20.0}/>
<T.DirectionalLight position={[10, 10, 2]} castShadow intensity={3.5}/>
<T.PointLight position={[10, 5, 0]}  intensity={400.0} />

<T.AmbientLight intensity={0.5} />

<!-- Stage -->
<T.Mesh rotation={rotation} geometry={model.stage} castShadow receiveShadow>
    <T.MeshStandardMaterial visible={true} color="white" wireframe={false}/>
</T.Mesh>

<!-- Roof -->
<T.Mesh rotation={rotation} geometry={model.roof} castShadow receiveShadow bind:ref={batteryModel}>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>

<!-- Battery -->
<T.Mesh rotation={rotation} geometry={model.battery} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={batteryVisible}/>
</T.Mesh>

<!-- <CustomRenderer selectedMesh={batteryModel} /> -->

<!-- Inverter -->
<T.Mesh rotation={rotation} geometry={model.inverter} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<!-- Solar Panel on roof -->
<T.Mesh rotation={rotation} geometry={model.solar} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={solarVisible}/>
</T.Mesh>

<!-- outside wall -->
<T.Mesh rotation={rotation} geometry={model.outsideWall} castShadow receiveShadow>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>

<!-- ev charger -->
<T.Mesh rotation={rotation} geometry={model.evCharger} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={evVisible}/>
</T.Mesh>

<!-- ev charger -->
<T.Mesh rotation={rotation} geometry={model.groundSolar} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={groundSolarVisible}/>
</T.Mesh>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
    <T.CircleGeometry args={[25, 64]}/>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>

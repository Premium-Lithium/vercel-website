<script>
    import { T, useFrame } from '@threlte/core'
    import { SolutionModel } from './solutionModel.js';
    import CustomRenderer from './CustomRenderer.svelte';
    import { OrbitControls } from '@threlte/extras'

    let model = new SolutionModel("test");

    // let rotation = 32 * Math.PI / 180;
    let batteryModel;
    const plBlue = "#28AAE2";

    let rotation = 0;
    const rotSpeed = 0.2;
    useFrame((state, delta) => {
        rotation += delta * rotSpeed;
    })
</script>

<T.FogExp2 attach="fog" args={['white', 0.015]} />

<T.OrthographicCamera makeDefault zoom={120.0} position={[10, 6, 10]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.OrthographicCamera>

<!-- todo: move these into a json configuration file -->
<T.DirectionalLight position={[10, 10, -4]} castShadow intensity={1.5} scale={20.0}/>
<T.DirectionalLight position={[10, 10, 2]} castShadow intensity={3.5}/>
<T.PointLight position={[10, 5, 0]}  intensity={600.0} />

<T.AmbientLight intensity={0.5} />

<!-- Stage -->
<T.Mesh geometry={model.stage} castShadow receiveShadow>
    <T.MeshStandardMaterial visible={true} color="white" wireframe={false}/>
</T.Mesh>

<!-- Roof -->
<T.Mesh geometry={model.roof} castShadow receiveShadow bind:ref={batteryModel}>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>

<!-- Battery -->
<T.Mesh geometry={model.battery} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<CustomRenderer selectedMesh={batteryModel} />

<!-- Inverter -->
<T.Mesh geometry={model.inverter} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<!-- Solar Panel on roof -->
<T.Mesh geometry={model.solar} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<!-- outside wall -->
<T.Mesh geometry={model.outsideWall} castShadow receiveShadow>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>

<!-- ev charger -->
<T.Mesh geometry={model.evCharger} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<!-- ev charger -->
<T.Mesh geometry={model.groundSolar} castShadow receiveShadow>
    <T.MeshStandardMaterial color={plBlue} wireframe={false} visible={true}/>
</T.Mesh>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
    <T.CircleGeometry args={[25, 64]}/>
    <T.MeshStandardMaterial color="white" wireframe={false} visible={true}/>
</T.Mesh>
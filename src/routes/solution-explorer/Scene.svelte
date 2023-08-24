<script>
    import { T, useFrame } from '@threlte/core'
    import { battery, inverter, stage, roof, roofSolar } from './solutionModel.js';
    import CustomRenderer from './CustomRenderer.svelte';
    import { OrbitControls } from '@threlte/extras'


    // let rotation = 32 * Math.PI / 180;
    let batteryModel;

    let rotation = 0;
    const rotSpeed = 0.2;
    useFrame((state, delta) => {
        rotation += delta * rotSpeed;
    })
</script>

<T.FogExp2 attach="fog" args={['#28AAE2', 0.015]} />

<T.OrthographicCamera makeDefault zoom={200.0} position={[0, 2, 10]} on:create={({ ref }) => {
    ref.lookAt(0, 2, 0)
}}></T.OrthographicCamera>


<!-- Above angled -->
<T.PerspectiveCamera makeDefault rotation={[0, 0, 0]} position={[4, 2.8, 4]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.PerspectiveCamera>

<!-- <T.OrthographicCamera makeDefault zoom={150.0} position={[5, 3, 5]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.OrthographicCamera> -->

<!-- Directly above -->
<!-- <T.OrthographicCamera makeDefault zoom={300.0} position={[0, 10, 0]} on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
}}></T.OrthographicCamera> -->

<!-- todo: move these into a json configuration file -->
<T.DirectionalLight position={[10, 10, -4]} castShadow intensity={1.5} scale={20.0}/>
<T.DirectionalLight position={[10, 10, 2]} castShadow intensity={2.5}/>
<T.PointLight position={[10, 5, 0]}  intensity={600.0} />

<T.AmbientLight intensity={0.3} />


<!-- Stage -->
<T.Mesh geometry={stage}  position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial visible={true} color="white" wireframe={false}/>
</T.Mesh>

<!-- Roof -->
<T.Mesh geometry={roof}  position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow bind:ref={batteryModel}>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>

<!-- Battery -->
<T.Mesh geometry={battery}  position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="#28AAE2" wireframe={false}/>
</T.Mesh>

<CustomRenderer selectedMesh={batteryModel} />

<!-- Inverter -->
<T.Mesh geometry={inverter}  position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="#28AAE2" wireframe={false}/>
</T.Mesh>

<!-- Solar Panel on roof -->
<T.Mesh geometry={roofSolar}  position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="#28AAE2" wireframe={false}/>
</T.Mesh>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
    <T.CircleGeometry args={[10, 64]}/>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>
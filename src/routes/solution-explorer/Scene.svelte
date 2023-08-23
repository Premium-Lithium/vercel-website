<script>
    import { T, useFrame } from '@threlte/core'
    import { battery, inverter, stage, roof } from './solutionModel.js';

    let rotation = 0;
    const rotSpeed = 0.00;
    useFrame((state, delta) => {
        rotation += delta * rotSpeed;
    })
</script>

<T.OrthographicCamera makeDefault zoom={200.0} position={[0, 1, 10]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.OrthographicCamera>

<T.OrthographicCamera makeDefault zoom={200.0} position={[10, 1, 0]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.OrthographicCamera>

<!-- Above angled -->
<!-- <T.PerspectiveCamera makeDefault position={[4, 2.8, 4]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.PerspectiveCamera> -->

<T.OrthographicCamera makeDefault zoom={150.0} position={[5, 3, 5]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.OrthographicCamera>

<!-- Directly above -->
<!-- <T.OrthographicCamera makeDefault zoom={300.0} position={[0, 10, 0]} on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
}}></T.OrthographicCamera> -->

<!-- todo: move these into a json configuration file -->
<T.DirectionalLight position={[10, 10, -4]} castShadow intensity={1.5} scale={20.0}/>
<T.DirectionalLight position={[10, 10, 2]} castShadow intensity=2.5/>
<T.PointLight position={[10, 5, 0]}  intensity={800.0} />

<T.AmbientLight intensity={2} />

<!-- Stage -->
<T.Mesh geometry={stage} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial visible={true} color="white" wireframe={false}/>
</T.Mesh>

<!-- Roof -->
<T.Mesh geometry={roof} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>

<!-- Battery -->
<T.Mesh geometry={battery} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>

<!-- Inverter -->
<T.Mesh geometry={inverter} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow receiveShadow>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
    <T.CircleGeometry args={[5, 40]}/>
    <T.MeshStandardMaterial color="white" wireframe={false}/>
</T.Mesh>
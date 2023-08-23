<script>
  import { T, useFrame } from '@threlte/core'
  import { BufferGeometry, BufferAttribute, MeshBasicMaterial } from 'three'

  let rotation = 0
  useFrame((state, delta) => {
    rotation += delta * 0.0
  })

  const geometry = new BufferGeometry();

  const vertices = new Float32Array([
    -1, -1, -1,  1, -1, -1,  1,  1, -1,
    1,  1, -1, -1,  1, -1, -1, -1, -1,

    -1, -1,  1,  1, -1,  1,  1,  1,  1,
    1,  1,  1, -1,  1,  1, -1, -1,  1,

    -1,  1, -1,  1,  1, -1,  1,  1,  1,
    1,  1,  1, -1,  1,  1, -1,  1, -1,

    -1, -1, -1,  1, -1, -1,  1, -1,  1,
    1, -1,  1, -1, -1,  1, -1, -1, -1,

    1, -1, -1,  1,  1, -1,  1,  1,  1,
    1,  1,  1,  1, -1,  1,  1, -1, -1,

    -1, -1, -1, -1,  1, -1, -1,  1,  1,
    -1,  1,  1, -1, -1,  1, -1, -1, -1,
  ]);

  const indices = new Uint16Array([
    0,  1,  2,  3,  4,  5,
    6,  7,  8,  9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35,
  ]);

  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
</script>

<T.Mesh
  position={{ y: 1 }}
  geometry={geometry}
  material={new MeshBasicMaterial({ wireframe: true })}
/>

<T.PerspectiveCamera
  makeDefault
  position={[5, 3, 5]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<!-- todo: move these into a json configuration file -->
<!-- <T.DirectionalLight position={[2, 10, 10]} castShadow intensity=1.5 scale=10.0/> -->
<!-- <T.DirectionalLight position={[10, 10, 2]} castShadow intensity=2.5/> -->
<T.PointLight position={[0, 5, 5]}  intensity={500.0} />

<T.AmbientLight intensity={1} />

<T.Mesh
  rotation.y={rotation}
  position.y={1}
  castShadow
>
  <T.BoxGeometry args={[2, 2, 2]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
  <T.CircleGeometry args={[5, 40]}/>
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
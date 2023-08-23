<script>
  import { T, useFrame } from '@threlte/core'

  let rotation = 0
  useFrame((state, delta) => {
    rotation += delta * 0.5
  })
</script>

<T.PerspectiveCamera
  makeDefault
  position={[2.5, 3, 5]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.AmbientLight intensity={0.9} />
<T.DirectionalLight position={[2, 10, 10]} />

<T.Mesh
  rotation.y={rotation}
  position.y={1}
>
  <T.BoxGeometry args={[2, 2, 2]} />
  <T.MeshStandardMaterial color="lightblue" />
</T.Mesh>

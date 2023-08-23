<script>
    import { T, useFrame } from '@threlte/core'
    import { BoxGeometry, BufferGeometry, BufferAttribute, MeshBasicMaterial, OrthographicCamera } from 'three'
    import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

    let rotation = 0;
    const rotSpeed = 0;
    useFrame((state, delta) => {
        rotation += delta * rotSpeed;
    })

    const wt = 0.15; // wall thickness
    const size = 2.6; // size of one wall (outer dimensions)
    const height = 1.9; // height of one wall (outer dimensions)
    const rl = size + wt * 3; // roof length
    const roofEdgeHeight = 0.15; // height of vertical roof edge
    const apexHeight = 0.6; // height of roof apex (above roof edge)

    let stage = buildStage();
    let roof = buildRoof();
    // let frontWall = buildFrontWall();

    function buildStage() {
        const floor = buildFloor();
        const rearWall = buildRearWall();

        const stage = mergeGeometries([ floor, rearWall ]);
        return stage;
    }

    function buildFloor() {
        const floor = new BoxGeometry(size, wt, size);
        floor.translate(0, wt / 2, 0);
        return floor;
    }

    function buildRearWall() {
        const leftWall = new BoxGeometry(wt, height - wt, size);
        leftWall.translate(-size / 2 + wt/2, height / 2 + wt / 2, 0);

        const rightWall = new BoxGeometry(size - wt, height - wt, wt);
        rightWall.translate(wt / 2, height / 2 + wt / 2, -size / 2 + wt/2)

        const walls = mergeGeometries([ leftWall, rightWall ]);

        return walls;
    }

    function buildRoof() {
        const base = new BoxGeometry(rl, roofEdgeHeight, rl);
        base.translate(0, height + roofEdgeHeight / 2, 0);
        delete base.attributes.uv; // remove UVs to avoid merge error

        const peak = buildRoofUpper();
        peak.translate(0, roofEdgeHeight, 0);

        const roof = mergeGeometries([ base, peak ]);
        return roof;
    }

    function buildRoofUpper() {
        const apexFront = { x: 0, y: apexHeight, z: -(size * 0.8) / 2 };
        const apexRear = { x: 0, y: apexHeight, z: (size * 0.8) / 2 };

        const roofUpper = new BufferGeometry();

        const hs = rl / 2; // half size
        const vertices = new Float32Array([
            // front left AED
            -hs, 0, -hs, // A, 0
            apexFront.x, apexFront.y, apexFront.z, // E, 1
            hs,  0, -hs, // D, 2

            // rear left ABFE
            -hs, 0, -hs, // A, 3
            -hs, 0, hs, // B, 6
            apexRear.x, apexRear.y, apexRear.z, // F, 5
            apexFront.x, apexFront.y, apexFront.z, // E, 4

            // rear right CFB
            hs,  0, hs, // C, 7
            apexRear.x, apexRear.y, apexRear.z, // F, 8
            -hs, 0, hs, // B, 9

            // front right DEFC
            hs,  0, -hs, // D, 10
            apexFront.x, apexFront.y, apexFront.z, // E, 11
            apexRear.x, apexRear.y, apexRear.z, // F, 12
            hs,  0, hs, // C, 13
        ]);

        const indices = new Uint16Array([
            // front left
            0,  1, 2, // A, E, D

            // rear left
            3,  4, 5, // A, F, E
            5,  6, 3, // A, B, F

            // rear right
            7,  8, 9, // C, F, B

            // front right
            10,  11, 12, // D, E, F
            12,  13, 10, // C, D, F
        ]);

        roofUpper.setIndex(new BufferAttribute(indices, 1));
        roofUpper.setAttribute('position', new BufferAttribute(vertices, 3));
        roofUpper.computeVertexNormals();

        roofUpper.translate(0, height, 0);

        return roofUpper;
    }
</script>

<T.PerspectiveCamera makeDefault position={[10, 0, 0]} on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
}}></T.PerspectiveCamera>

<!-- Above angled -->
<T.PerspectiveCamera makeDefault position={[4, 2.3, 4]} on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
}}></T.PerspectiveCamera>

<!-- Directly above -->
<!-- <T.OrthographicCamera makeDefault zoom={300.0} position={[0, 10, 0]} on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
}}></T.OrthographicCamera> -->

<!-- todo: move these into a json configuration file -->
<!-- <T.DirectionalLight position={[2, 10, 10]} castShadow intensity=1.5 scale=10.0/> -->
<!-- <T.DirectionalLight position={[10, 10, 2]} castShadow intensity=2.5/> -->
<T.PointLight position={[2, 5, 5]}  intensity={500.0} />

<T.AmbientLight intensity={1} />

<!-- Stage -->
<T.Mesh geometry={stage} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow>
    <T.MeshStandardMaterial visible={true} color="green" wireframe={false}/>
</T.Mesh>

<!-- Roof -->
<T.Mesh geometry={roof} rotation={[0, rotation, 0]} position={[ 0.0, 0.0, 0.0 ]} castShadow>
    <T.MeshStandardMaterial color="red" wireframe={false}/>
</T.Mesh>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
    <T.CircleGeometry args={[5, 40]}/>
    <T.MeshStandardMaterial color="blue" wireframe={false}/>
</T.Mesh>
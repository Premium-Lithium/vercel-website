import { BoxGeometry, BufferGeometry, BufferAttribute, MeshBasicMaterial, OrthographicCamera } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


const wt = 0.17; // wall thickness
const size = 2.8; // size of one wall (outer dimensions)
const height = 2.2; // height of one wall (outer dimensions)
const rl = size * 1.1; // roof length
const roofEdgeHeight = 0.15; // height of vertical roof edge
const apexHeight = 0.6; // height of roof apex (above roof edge)
const battHeight = 0.7; // height of battery
const floorClearance = 0.05; // height of objects off floor
const battInverterSpacing = 0.3; // horizontal space between battery and inverter
const battWidth = 0.9;
const battDepth = 0.2;
const wallClearance = 0.05; // distance of wall-mounted objects off the wall
const inverterDepth = 0.17;
const inverterHeight = 0.6;
const inverterWidth = 0.3;


let stage = buildStage();
let roof = buildRoof();
let battery = buildBattery();
let inverter = buildInverter();
let roofSolar = buildRoofSolar();

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


// todo: store and reuse of `x` somewhere (class member variable?)
function buildBattery() {
    const battery = new BoxGeometry(battDepth, battHeight, battWidth);

    const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

    battery.translate(
        -size / 2 + wt + battDepth / 2 + wallClearance,
        battHeight / 2 + wt + floorClearance,
        size / 2 - battWidth / 2 - wt - wallClearance - x
    );

    return battery;
}


function buildInverter() {
    const inverter = new BoxGeometry(inverterDepth, inverterHeight, inverterWidth);

    const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

    inverter.translate(
        -size / 2 + wt + inverterDepth / 2 + wallClearance,
        wt + floorClearance + (inverterHeight / 2) + (battHeight - inverterHeight),
        -size / 2 + inverterWidth / 2 + wt + wallClearance + x
    );

    return inverter;
}


function buildRoofSolar() {
    const panelWidth = size * 0.6;
    const panelThickness = 0.04;

    const availableWidth = Math.sqrt(Math.pow(rl / 2, 2) + Math.pow(apexHeight, 2));
    const padding = 0.3; // Space between panels and roof edge
    const panelHeight = availableWidth - padding * 2;

    const roofSolar = new BoxGeometry(panelHeight, panelThickness, panelWidth);

    const angle = (Math.PI - Math.atan(apexHeight / (rl / 2)));
    roofSolar.rotateZ(angle);

    const roofSurfaceMidPoint = { x: rl / 4, y: height + apexHeight / 2 + roofEdgeHeight };
    const panelCentre = normalVector(angle, roofSurfaceMidPoint.x, roofSurfaceMidPoint.y, -panelThickness / 2);
    roofSolar.translate(panelCentre.x, panelCentre.y, 0);

    return roofSolar;
}


function normalVector(angle, x, y, length) {
  // Calculate the angle of the normal (perpendicular to the line)
  const normalAngle = angle + Math.PI / 2;

  // Calculate the components of the normal vector
  const nx = Math.cos(normalAngle) * length;
  const ny = Math.sin(normalAngle) * length;

  // New point after traveling along the normal
  const newX = x + nx;
  const newY = y + ny;

  return { x: newX, y: newY, nx: nx, ny: ny };
}


export { battery, inverter, roof, stage, roofSolar };

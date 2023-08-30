import { BoxGeometry, BufferGeometry, BufferAttribute /*, MeshBasicMaterial, OrthographicCamera */ } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalVector } from './geometry-utils';
// import { MeshLine, MeshLineMaterial } from 'three.meshline';


const wt = 0.17; // wall thickness
const size = 2.6; // size of one wall (outer dimensions)
const height = 2.2; // height of one wall (outer dimensions)
const rl = size * 1.1; // roof length
const roofEdgeHeight = 0.15; // height of vertical roof edge
const apexHeight = 0.55; // height of roof apex (above roof edge)
const battHeight = 0.7; // height of battery
const floorClearance = 0.05; // height of objects off floor
const battInverterSpacing = 0.4; // horizontal space between battery and inverter
const battWidth = 0.9;
const battDepth = 0.2;
const wallClearance = 0.00; // distance of wall-mounted objects off the wall
const inverterDepth = 0.17;
const inverterHeight = 0.5;
const inverterWidth = 0.3;
const panelWidth = size * 0.6;
const panelThickness = 0.06;


export default class SolutionModel {
    constructor(option) {
        this.option = option;

        this.stage = this.#buildStage();
        this.roof = this.#buildRoof();
        this.battery = this.#buildBattery();
        this.inverter = this.#buildInverter();
        this.solar = this.#buildRoofSolar();
        this.outsideWall = this.#buildOutsideWall();
        this.evCharger = this.#buildEvCharger();
        this.groundSolar = this.#buildGroundSolar();

        // temp
        this.camPos = 0;
        // temp
    }

    // set propertyType(type) {
    // todo
    // }
    focusMainView() {
        // todo: move cameras
        console.log("Focusing on main view...");
        this.camPos = 10;
    }

    focusSolar() {
        console.log("Focusing on solar view...");
        this.camPos = 0;
    }

    displayOption() {
        console.log('Option value is ' + this.option);
    }


    #buildStage() {
        const floor = this.#buildFloor();
        const rearWalls = this.#buildRearWalls();
        const stage = mergeGeometries([ floor, rearWalls ]);
        return stage;
    }


    #buildFloor() {
        const floor = new BoxGeometry(size, wt, size);
        floor.translate(0, wt / 2, 0);
        return floor;
    }


    #buildRearWalls() {
        const leftWall = new BoxGeometry(wt, height - wt, size);
        leftWall.translate(-size / 2 + wt/2, height / 2 + wt / 2, 0);

        const rightWall = new BoxGeometry(size - wt, height - wt, wt);
        rightWall.translate(wt / 2, height / 2 + wt / 2, -size / 2 + wt/2)

        const walls = mergeGeometries([ leftWall, rightWall ]);

        return walls;
    }


    #buildRoof() {
        const base = new BoxGeometry(rl, roofEdgeHeight, rl);
        base.translate(0, height + roofEdgeHeight / 2, 0);
        delete base.attributes.uv; // remove UVs to avoid merge error

        const upper = this.#buildRoofUpper();
        upper.translate(0, roofEdgeHeight, 0);

        const roof = mergeGeometries([ base, upper ]);
        return roof;
    }


    #buildRoofUpper() {
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
    #buildBattery() {
        const battery = new BoxGeometry(battWidth, battHeight, battDepth);

        const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

        battery.translate(
            -size / 2 + battWidth / 2 + wt + wallClearance + x,
            battHeight / 2 + wt + floorClearance,
            -size / 2 + wt + battDepth / 2 + wallClearance
        );

        return battery;
    }


    #buildInverter() {
        const inverter = new BoxGeometry(inverterWidth, inverterHeight, inverterDepth);

        const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

        inverter.translate(
            size / 2 - inverterWidth / 2 - wt - wallClearance - x,
            wt + floorClearance + (inverterHeight / 2) + (battHeight - inverterHeight),
            -size / 2 + wt + inverterDepth / 2 + wallClearance
        );

        return inverter;
    }


    #buildRoofSolar() {
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


    #buildOutsideWall() {
        const roofUpper = new BufferGeometry();

        const hs = size / 2;

        const A = [ hs, wt, hs];
        const B = [ -hs + wt, height, hs];
        const E = [ -hs + wt, wt, hs];

        const C = [ hs, wt, hs - wt];
        const D = [ -hs + wt, height, hs - wt];
        const F = [ -hs + wt, wt, hs - wt];

        const vertices = new Float32Array([
            ...A, // 0
            ...B, // 1
            ...E, // 2

            ...A, // 3
            ...C, // 4
            ...D, // 5
            ...B, // 6

            ...C, // 7
            ...F, // 8
            ...D // 9
        ]);

        const indices = new Uint16Array([
            0, 1, 2, // A, B, E

            3, 4, 5, // A, C, D
            5, 6, 3, // D, B, A

            7, 8, 9 // F, C, D
        ]);

        roofUpper.setIndex(new BufferAttribute(indices, 1));
        roofUpper.setAttribute('position', new BufferAttribute(vertices, 3));
        roofUpper.computeVertexNormals();

        return roofUpper;
    }


    #buildEvCharger() {
        const height = 0.4;
        const width = 0.2;
        const depth = 0.1;
        const evCharger = new BoxGeometry(width, height, depth);

        // const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

        const hs = size / 2;
        evCharger.translate(
            wallClearance + wt + width / 2,
            wt + floorClearance + (height / 2),
            hs + wallClearance + depth / 2
        );

        return evCharger;
    }


    #buildGroundSolar() {
        const panelHeight = 1;

        // todo: translate solar panel upwards to place edge on ground as angle changes
        const groundMountAngle_degs = 30;

        const groundSolar = new BoxGeometry(panelHeight, panelThickness, panelWidth);

        const angle = groundMountAngle_degs * Math.PI / 180;
        groundSolar.rotateZ(-angle);

        // const roofSurfaceMidPoint = { x: rl / 4, y: height + apexHeight / 2 + roofEdgeHeight };
        // const panelCentre = normalVector(angle, roofSurfaceMidPoint.x, roofSurfaceMidPoint.y, -panelThickness / 2);
        // roofSolar.translate(panelCentre.x, panelCentre.y, 0);

        const panelCentre = { x: 3, y: 0.2 };
        groundSolar.translate(panelCentre.x, panelCentre.y, -1);

        return groundSolar;
    }
}


export { SolutionModel };

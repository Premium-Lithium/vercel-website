// This class provides the API through which all components interact with the solution model.
// The `SolutionVisualisation` knows how to render the model, but does not know how to manipulate it.
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


class SolutionModel {
    constructor() {

        let floor = {
            height: wt,
            width: size,
        }
    }

    // todo: decide on interface to expose for controlling the model (focus on products, add products)
    focusOn() {
        // todo: move cameras
        console.log("Focusing on main view...");
        this.camPos = 10;
    }

    focusSolar() {
        console.log("Focusing on solar view...");
        this.camPos = 0;
    }

    get floor() {
        return {
            translation: { x: 0, y: wt / 2, z: 0 },
            dims: { x: size, y: wt, z: size, }
        }
    }

    get rearWalls() {
        return {
            left: {
                dims: { x: wt, y: height - wt, z: size },
                translation: { x: -size / 2 + wt / 2, y: height / 2 + wt / 2, z: 0 }
            },
            right: {
                dims: { x: size - wt, y: height - wt, z: wt },
                translation: { x: wt / 2, y: height / 2 + wt / 2, z: -size / 2 + wt/2 }
            }
        }
    }

    get roof() {
        return {
            base: {
                dims: { x: rl, y: roofEdgeHeight, z: rl },
                translation: { x: 0, y: height + roofEdgeHeight / 2, z: 0 }
            },
            upper: {
                apexCoords: {
                    frontLeft: { x: 0, y: apexHeight, z: -(size * 0.8) / 2 },
                    rearRight: { x: 0, y: apexHeight, z: -(size * 0.8) / 2 },
                },
                translation: { x: 0, y: height + roofEdgeHeight, z: 0 }
            }
        }
    }

    get battery() {
        const x = (size - (wt + wallClearance) * 2 - (battWidth + battInverterSpacing + inverterWidth)) / 2;

        return {
            dims: { x: battWidth, y: battHeight, z: battDepth },
            translation: {
                x: -size / 2 + battWidth / 2 + wt + wallClearance + x,
                y: battHeight / 2 + wt + floorClearance,
                z: -size / 2 + wt + battDepth / 2 + wallClearance
            }
        }
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

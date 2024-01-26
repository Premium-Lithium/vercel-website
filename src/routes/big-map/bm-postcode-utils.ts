import { installerMarkersArray, layersLoading, mapOptionPanels, platformHomeownerMarkers, platformInstallerMarkers, postcodeFilter, postcodes, type LatLongObj, type PostcodeFilterElement } from "./bm-stores"
import * as turf from '@turf/turf'
import { get } from "svelte/store";
import { parseString } from 'xml2js';
import { updateMap } from "./bm-pipedrive-utils";
import { displayMarkers } from "./bm-platform-utils";

interface Coordinates {
    longitude: number;
    latitude: number;
    altitude: number;
}

// turf.pointsWithinPolygon(turf.points([[lng, lat]]), polygon) // example usage for checking if a point is within a polygon

export async function loadKmlLayers() {
    console.log("Loading KML Layers")
    let layers = await fetch('/big-map/postcode/', {
        method: "GET"
    })
    let kmlLayers = (await layers.json()).body
    let postcodeAreaFilter: Array<PostcodeFilterElement> = []
    for (let layer of kmlLayers) {
        try {
            let polygonCoords = await createPolygon(layer)
            let polygon = turf.polygon([polygonCoords.features[0].geometry.coordinates[0]])
            let postcodeArea: PostcodeFilterElement = {
                name: layer.name,
                selected: false,
                layer: polygon
            }
            postcodeAreaFilter.push(postcodeArea)
        }
        catch {
            // don't care
        }
    }
    layersLoading.set(false)
    postcodeFilter.set(postcodeAreaFilter)
}

async function createPolygon(layer: { name: string, kml: string }) {
    let polygonCoords = await extractPolygonCoordinates(layer.kml)
    const geoJSONPolygons = convertToGeoJSON(polygonCoords);
    return geoJSONPolygons
}

async function extractPolygonCoordinates(kml: string): Promise<Coordinates[][]> {
    return new Promise((resolve, reject) => {
        parseString(kml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const placemarks = result.kml.Document[0].Placemark || result.kml.Placemark || [];
                    const polygonCoordinates: Coordinates[][] = placemarks.map((placemark: any) => {
                        if (placemark.Polygon && placemark.Polygon[0].outerBoundaryIs && placemark.Polygon[0].outerBoundaryIs[0].LinearRing) {
                            const coordsString: string = placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0];
                            const vertices: Coordinates[] = coordsString.split(' ').map((coordString: string) => {
                                const [longitude, latitude, altitude]: number[] = coordString.split(',').map(Number);
                                return { longitude, latitude, altitude };
                            });

                            // Ensure LinearRing has 4 or more positions
                            if (vertices.length >= 4) {
                                // Append the first element to the end to close the polygon
                                vertices.push(vertices[0]);
                                return vertices;
                            }
                        }

                        return [];
                    });
                    resolve(polygonCoordinates);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

function convertToGeoJSON(coordinates: Coordinates[][]): any {
    const polygons = coordinates.map((polygonCoords) => {
        const coordinatesArray = polygonCoords.map(coord => [coord.longitude, coord.latitude]);
        return turf.polygon([coordinatesArray]);
    });
    return turf.featureCollection(polygons);
}

export function filterMarkersByPostcode() {
    let postcodeRegions = get(postcodeFilter)
    let selectedPostcodes = get(postcodes)
    console.log(postcodeRegions, selectedPostcodes)
    for (let postcode of selectedPostcodes) {
        for (let region of postcodeRegions) {
            if (region.name === postcode) {
                updatePipedriveMarkers(region.layer)
                updatePlatformMarkers(region.layer)
                updateInstallerMarkers(region.layer)
            }
        }
    }
}

function updatePipedriveMarkers(polygon: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>) {
    let currentPanels = get(mapOptionPanels)
    for (let panel in currentPanels) {
        for (let marker of currentPanels[panel].markers) {
            if (!(checkIfMarkerWithinPostcode(marker.latLng, polygon))) {
                marker.visible = false
            }
        }
    }
    mapOptionPanels.set(currentPanels)
    updateMap()
}

function updatePlatformMarkers(polygon: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>) {
    let installers = get(platformInstallerMarkers)
    let homeowners = get(platformHomeownerMarkers)
    for (let installer of installers) {
        if (checkIfMarkerWithinPostcode(installer.latLng, polygon))
            installer.visible = false
    }
    for (let homeowner of homeowners) {
        if (checkIfMarkerWithinPostcode(homeowner.latLng, polygon))
            homeowner.visible = false
    }
    platformInstallerMarkers.set(installers)
    platformHomeownerMarkers.set(homeowners)
    displayMarkers(installers)
    displayMarkers(homeowners)
}

function updateInstallerMarkers(polygon: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>) {
    let installerMarkers = get(installerMarkersArray)
    for (let marker of installerMarkers) {
        let latLng = marker.getPosition()
        if (latLng)
            if (!(checkIfMarkerWithinPostcode({ lat: latLng.lat(), lng: latLng.lng() }, polygon))) {
                marker.setMap(null)
            }
    }
}

function checkIfMarkerWithinPostcode(markerLoc: LatLongObj, polygon: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>): boolean {
    if (turf.pointsWithinPolygon(turf.points([[markerLoc.lng, markerLoc.lat]]), polygon).features[0])
        return true
    return false
}
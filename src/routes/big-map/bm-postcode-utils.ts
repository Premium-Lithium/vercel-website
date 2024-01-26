import { get } from "svelte/store"
import { layersLoading, postcodeFilter, type PostcodeFilterElement } from "./bm-stores"
import * as turf from '@turf/turf'
import { parseString } from 'xml2js';

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
        try{
            let polygonCoords = await createPolygon(layer)
            let polygon = turf.polygon([polygonCoords.features[0].geometry.coordinates[0]])
            // TODO: create postcodeFilter array {name polygon selected}
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

import type { Properties } from '@turf/helpers';
import type { Feature } from '@turf/helpers';
import { supabase } from '$lib/supabase';
import { featureCollection, point, polygon, type Polygon } from '@turf/helpers';

export const serializeCoordinates = (coords: [[Number, Number]]) => {
    return coords.reduce(
        (acc, cv, ci, arr) => {
            return `${acc}${ci === 0 ? '' : ','}${cv[0].toString()},${cv[1].toString()}`;
        }, ""
    )
}

export const deserializeCoordinates = (coordString: String) => {
    let coordSplit = coordString.split(',').map(x => parseFloat(x));
    let coords = [];
    for(let i = 0; i < coordSplit.length; i+=2) {
        coords.push([coordSplit[i], coordSplit[i+1]]);
    }
    return coords;


}

export async function loadPolygonsFromDatabase(db_name: string) {
    let {data, error} = await supabase.from(db_name).select('*');
    if(!data || error) {
        console.log(error);
        return;
    }
    console.log(data);
    let polygons: [Feature<Polygon, Properties>];
    let installationManagerDetails: [{"id": Number, "name": string}];
    data.forEach(x => {
        installationManagerDetails.push({"id": x.id, "name": x.name})
        if(x.latlong) {
            let p = polygon([deserializeCoordinates(x.latlong)])
            polygons.push(p);
        }
    });
    return [polygons, installationManagerDetails];
}
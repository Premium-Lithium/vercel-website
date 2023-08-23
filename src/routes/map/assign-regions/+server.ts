import { json } from "@sveltejs/kit";
import { supabase } from '$lib/supabase';
import { featureCollection, point, polygon, 
         type Polygon, type Feature, type Properties } from '@turf/helpers';
import { deserializeCoordinates, serializeCoordinates, fetchLatlonFromPostcodesPostcodes,
         fetchInstallerDataFromPipedrive, fetchJobDataFromPipedrive, pointsInPolygonFromList,
         fetchRelevantData } from "$lib/mapUtils";

const DB_NAME: string = "installation-manager-regions";

let installationManagerDetails;
let polygons;

export async function POST ({request}){
    if(!request.body) return json({message: "Request needs a body"}, {status: 400});
    let dealInfo = await request.json();
    await loadPolygonsFromDatabase();
    let latlon = (await fetchLatlonFromPostcodesPostcodes([dealInfo.current['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code']]))[0];
    console.log(latlon);
    let dealGeographicalPoint = point([latlon.result.longitude, latlon.result.latitude]);
    pointsInPolygonFromList([dealGeographicalPoint], polygons).forEach((p, i, a) => {
        console.log(p.features);
        if(p.features.length != 0) {
            console.log(installationManagerDetails[i].name);
        }
    });
    return json({message: "okay"}, {status: 200});
}
    

const loadPolygonsFromDatabase = async () => {
    installationManagerDetails = [];
    polygons = [];
    let {data, error} = await supabase.from(DB_NAME).select('*');
    if(!data || error) {
        return;
    }
    data.forEach(x => {
        installationManagerDetails.push({"id": x.id, "name": x.name})
        if(x.latlong) {
            let p = polygon([deserializeCoordinates(x.latlong)])
            polygons.push(p);
        }
    });
}
// TODO
// Load regions from database serverside
// Work out if updated deal is inside any region
// If so, call function below with dealId, and installerManagerUserID.

async function syncJobOwnersToPipedrive(dealId: Number, installerManagerUserID: Number) {
    // This needs to be ran at time of close, so possibly set up an endpoint with a webhook for this.
    // on deal.update.. if deal.status open -> won.. update owner in pipedrive. 
    await fetch(`https://api.pipedrive.com/api/v1/deals/${dealId}?api_token=77a5356773f422eb97c617fd7c37ee526da11851`, {
        method: 'PUT',
        body: JSON.stringify({'user_id': installerManagerUserID}),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}


import { json } from "@sveltejs/kit";
import { supabase } from '$lib/supabase';
import { featureCollection, point, polygon, 
         type Polygon, type Feature, type Properties } from '@turf/helpers';
import { deserializeCoordinates, serializeCoordinates, fetchLatlonFromPostcodesPostcodes,
         fetchInstallerDataFromPipedrive, fetchJobDataFromPipedrive, pointsInPolygonFromList,
         fetchRelevantData } from "$lib/mapUtils";

const DB_NAME: string = "installation-manager-regions";

let installationManagerDetails: [{id: Number, name: string}];
let polygons: [Feature<Polygon, Properties>];

export async function POST ({request}){
    if(!request.body) return json({message: "Request needs a body"}, {status: 400});
    let dealInfo = await request.json();
    polygons = loadPolygonsFromDatabase();
    let relevantDealInfo = await fetchRelevantData(dealInfo, "job");
    console.log(relevantDealInfo);
    let dealGeographicalPoint = point([relevantDealInfo.latitude, relevantDealInfo.longitude]);
    console.log(pointsInPolygonFromList([dealGeographicalPoint], polygons));
    return json({message: "okay"}, {status: 200});
}
    

const loadPolygonsFromDatabase = async () => {
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


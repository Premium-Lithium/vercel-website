import { json } from "@sveltejs/kit";
import { supabase } from '$lib/supabase';
import { point, polygon} from '@turf/helpers';
import { PIPEDRIVE_API_TOKEN } from "$env/static/private";
import { deserializeCoordinates, fetchLatlonFromPostcodesPostcodes, pointInPolygonFromList } from '$lib/mapUtils';

const DB_NAME: string = "installation-manager-regions";

let installationManagerDetails;
let polygons;

export async function POST ({request}){
    if(!request.body) return json({message: "Request needs a body"}, {status: 400});
    let dealInfo = await request.json();
    if(!(dealInfo.previous['status'] == "open" && dealInfo.current['status'] == 'won')) {
        return json({message: "Unchanged deal"}, {status: 202});
    }
    await loadPolygonsFromDatabase();
    let latlon = (await fetchLatlonFromPostcodesPostcodes([dealInfo.current['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code']]))[0];
    let dealGeographicalPoint = point([latlon.result.longitude, latlon.result.latitude]);
    console.log(dealGeographicalPoint);
    // polygons.forEach((p) => {p.geometry.coordinates.forEach((x) => console.log(x[0], x[1]))});
    let polygonPointIsIn = pointInPolygonFromList(dealGeographicalPoint, polygons);
    if(polygonPointIsIn != null) {
        await syncJobOwnersToPipedrive(dealInfo.meta.id, installationManagerDetails[polygonPointIsIn].id);
        return json({message: `Deal with id ${dealInfo.meta.id} has had it's owner updated.`}, {status: 200});
    }
    return json({message: `Deal with id ${dealInfo.meta.id} not inside a defined region.`}, {status: 202});
    
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

async function syncJobOwnersToPipedrive(dealId: Number, installerManagerUserID: Number) {
    // This is ran at time of deal close via a Pipedrive Webhook.
    // on deal.update.. if deal.status open -> won.. update owner in pipedrive. 
    let res = await fetch(`https://api.pipedrive.com/api/v1/deals/${dealId}?api_token=${PIPEDRIVE_API_TOKEN}`, {
        method: 'PUT',
        body: JSON.stringify({'user_id': installerManagerUserID}),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}


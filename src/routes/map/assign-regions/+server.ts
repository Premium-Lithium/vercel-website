// import { json } from "@sveltejs/kit";
// import { supabase } from '$lib/supabase';
// import '@turf/points-within-polygon';
// import { featureCollection, point, polygon, type Polygon} from '@turf/helpers';
// import pointsWithinPolygon from '@turf/points-within-polygon';
// import { serializeCoordinates, deserializeCoordinates, loadPolygonsFromDatabase } from '$lib/mapUtils';

// const DB_NAME: string = "installation-manager-regions";

// let installationManagerDetails: [{id: Number, name: string}];

// export async function POST ({request}){
//     if(!request.body) return json({message: "Request needs a body"}, {status: 400});
//     let dealInfo = await request.json();
//     if(dealInfo.previous.status === 'open' && dealInfo.current.status === 'won') {
//         let polygons = await loadPolygonsFromDatabase(DB_NAME);

//     }
// }

// // TODO
// // Load regions from database serverside
// // Work out if updated deal is inside any region
// // If so, call function below with dealId, and installerManagerUserID.

// async function syncJobOwnersToPipedrive(dealId: Number, installerManagerUserID: Number) {
//     // This needs to be ran at time of close, so possibly set up an endpoint with a webhook for this.
//     // on deal.update.. if deal.status open -> won.. update owner in pipedrive. 
//     await fetch(`https://api.pipedrive.com/api/v1/deals/${dealId}?api_token=77a5356773f422eb97c617fd7c37ee526da11851`, {
//         method: 'PUT',
//         body: JSON.stringify({'user_id': installerManagerUserID}),
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
// }


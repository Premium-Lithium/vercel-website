import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { point, polygon } from '@turf/helpers';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';
import {
	deserializeCoordinates,
	fetchLatlonFromPostcodesPostcodes,
	pointInPolygonFromList
} from '$lib/mapUtils';

const DB_NAME: string = 'installation-manager-regions';

let installationManagerDetails;
let polygons;

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 });
	let dealInfo = await request.json();
	if (!(dealInfo.previous['status'] == 'open' && dealInfo.current['status'] == 'won')) {
		return json({ message: 'Unchanged deal' }, { status: 202 });
	}
	await loadPolygonsFromDatabase();
	try {
		let latlon = (
			await fetchLatlonFromPostcodesPostcodes([
				dealInfo.current['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code']
			])
		)[0];
		let dealGeographicalPoint = point([latlon.result.longitude, latlon.result.latitude]);
		console.log(dealGeographicalPoint);
		let polygonPointIsIn = pointInPolygonFromList(dealGeographicalPoint, polygons);
		if (polygonPointIsIn != null) {
			await syncJobOwnersToPipedrive(
				dealInfo.meta.id,
				installationManagerDetails[polygonPointIsIn].id,
				dealInfo.current['user_id']
			);
			return json(
				{ message: `Deal with id ${dealInfo.meta.id} has had it's owner updated.` },
				{ status: 200 }
			);
		}
		return json(
			{ message: `Deal with id ${dealInfo.meta.id} not inside a defined region.` },
			{ status: 405 }
		);
	} catch (e) {
		try {
			let latlon = (
				await fetchLatlonFromPostcodesPostcodes([
					dealInfo.current['5849f39e5668de78c3342074d94a7ed5910e3258']
				])
			)[0];
			let dealGeographicalPoint = point([latlon.result.longitude, latlon.result.latitude]);
			console.log(dealGeographicalPoint);
			let polygonPointIsIn = pointInPolygonFromList(dealGeographicalPoint, polygons);
			if (polygonPointIsIn != null) {
				let isOk = await syncJobOwnersToPipedrive(
					dealInfo.meta.id,
					installationManagerDetails[polygonPointIsIn].id,
					dealInfo.current['user_id']
				);
				if (isOk)
					return json(
						{ message: `Deal with id ${dealInfo.meta.id} has had it's owner updated.` },
						{ status: 200 }
					);
			}
			return json(
				{ message: `Deal with id ${dealInfo.meta.id} not inside a defined region.` },
				{ status: 405 }
			);
		} catch (e) {
			return json({ message: e }, { status: 500 });
		}
	}
}

const loadPolygonsFromDatabase = async () => {
	installationManagerDetails = [];
	polygons = [];
	let { data, error } = await supabase.from(DB_NAME).select('*');
	if (!data || error) {
		return;
	}
	data.forEach((x) => {
		installationManagerDetails.push({ id: x.id, name: x.name });
		if (x.latlong) {
			let p = polygon([deserializeCoordinates(x.latlong)]);
			polygons.push(p);
		}
	});
};

async function syncJobOwnersToPipedrive(
	dealId: Number,
	installerManagerUserID: Number,
	dealOwnerId: Number
) {
	// This is ran at time of deal close via a Pipedrive Webhook.
	// on deal.update.. if deal.status open -> won.. update owner in pipedrive.
	// 'da0db4682fb1eeb8aa85e1419d50dd5766fc6d2b' is the 'Sales Contact' custom fiel

	console.log('dealOwnerId', dealOwnerId);
	console.log('installerManagerId', installerManagerUserID);
	let res = await fetch(
		`https://api.pipedrive.com/api/v1/deals/${dealId}?api_token=${PIPEDRIVE_API_TOKEN}`,
		{
			method: 'PUT',
			body: JSON.stringify({
				'user_id': installerManagerUserID,
				'da0db4682fb1eeb8aa85e1419d50dd5766fc6d2b': dealOwnerId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
	console.log(res);

	return res.ok;
}

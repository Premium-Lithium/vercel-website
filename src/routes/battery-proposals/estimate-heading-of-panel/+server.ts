import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { buildingCoords, roofCoords } = await request.json()
	const { lat: roofLat, lon: roofLon } = roofCoords
	const { lat: buildingLat, lon: buildingLon } = buildingCoords
	let res = await fetch(`https://vercel-website-liart.vercel.app/solar-proposals/google-solar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ lat: buildingLat, lon: buildingLon })
	})
	if (!res.ok) return json({ message: res.statusText }, { status: 500 })
	let googleSolarData = await res.json()
	let centers = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
		return roof.center
	})
	let boundingBoxes = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
		return roof.boundingBox
	})

	let closestCenter = null
	let closestCenterIndice = null
	let closestDist = null
	centers.forEach((center, i) => {
		if (
			!closestCenter ||
			closestDist > Math.abs(center.latitude - roofLat) + Math.abs(center.longitude - roofLon)
		)
			closestCenter = center
		closestCenterIndice = i
	})

	let boundingBoxesContainingPoint = []

	boundingBoxes.forEach((bounds, i, a) => {
		if (
			roofLat > bounds.sw.latitude &&
			roofLat < bounds.ne.latitude &&
			roofLon > bounds.sw.longitude &&
			roofLon < bounds.ne.longitude
		) {
			boundingBoxesContainingPoint.push(googleSolarData.solarPotential.roofSegmentStats[i])
		}
	})

	return new Response(
		JSON.stringify({
			closestCenter: googleSolarData.solarPotential.roofSegmentStats[closestCenterIndice],
			boundingBoxesContainingPoint
		}),
		{
			status: res.status,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)
}

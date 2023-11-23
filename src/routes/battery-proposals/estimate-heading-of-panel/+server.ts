import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { lat, lon } = await request.json()

	let res = await fetch(`https://vercel-website-liart.vercel.app/solar-proposals/google-solar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ lat, lon })
	})
	if (!res.ok) return json({ message: res.statusText }, { status: res.status })
	let googleSolarData = await res.json()

	console.log(googleSolarData)

	let centers = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
		return roof.center
	})
	let boundingBoxes = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
		return roof.boundingBox
	})

	let closestCenter = null
	let closestDist = -1
	centers.forEach((center) => {
		if (
			!closestCenter ||
			closestDist > Math.abs(center.latitude - lat) + Math.abs(center.longitude - lon)
		)
			closestCenter = center
	})
	console.log(closestCenter)

	boundingBoxes.forEach((bounds, i, a) => {
		if (
			lat > bounds.sw.latitude &&
			lat < bounds.ne.latitude &&
			lon > bounds.sw.longitude &&
			lon < bounds.ne.longitude
		)
			console.log(bounds)
	})
}

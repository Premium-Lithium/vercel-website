import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { coords } = await request.json()
	if (coords.length == 1) {
		const { lat, lon } = coords[0]
		let res = await fetch(`https://vercel-website-liart.vercel.app/solar-proposals/google-solar`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ lat, lon, quality: 'MEDIUM' })
		})
		if (!res.ok) return json({ message: res.statusText }, { status: res.status })
		let googleSolarData = await res.json()

		let centers = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
			return roof.center
		})
		let boundingBoxes = googleSolarData.solarPotential.roofSegmentStats.map((roof) => {
			return roof.boundingBox
		})

		let closestCenter = null
		let closestCenterIndice = 0
		let closestDist = -1
		centers.forEach((center, i) => {
			if (
				!closestCenter ||
				closestDist > Math.abs(center.latitude - lat) + Math.abs(center.longitude - lon)
			)
				closestCenter = center
			closestCenterIndice = i
		})

		let boundingBoxesContainingPoint = []

		boundingBoxes.forEach((bounds, i, a) => {
			if (
				lat > bounds.sw.latitude &&
				lat < bounds.ne.latitude &&
				lon > bounds.sw.longitude &&
				lon < bounds.ne.longitude
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
}

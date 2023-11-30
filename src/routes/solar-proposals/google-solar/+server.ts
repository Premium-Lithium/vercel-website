import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { lat, lon, quality } = await request.json()
	let qualities = ['HIGH', 'MEDIUM', 'LOW']
	if (!qualities.includes(quality))
		return json({ message: 'quality must be HIGH, MEDIUM or LOW' }, { status: 400 })
	let res
	res = await fetch(
		`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&requiredQuality=${quality}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
		{ method: 'GET' }
	)
	const data = await res.json()
	return new Response(JSON.stringify(data), {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

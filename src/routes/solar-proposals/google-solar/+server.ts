import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { lat, lon } = await request.json()
	let qualities = ['HIGH', 'MEDIUM', 'LOW']
	let res
	try {
		res = await fetch(
			`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&requiredQuality=${qualities[0]}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
			{ method: 'GET' }
		)
		console.log(res)
	} catch (e) {
		try {
			res = await fetch(
				`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&requiredQuality=${qualities[1]}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
				{ method: 'GET' }
			)
			console.log(res)
		} catch (e) {
			try {
				res = await fetch(
					`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&requiredQuality=${qualities[2]}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
					{ method: 'GET' }
				)
				console.log(res)
			} catch (e) {
				return new Response(JSON.stringify(e), {
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				})
			}
		}
	}
	const data = await res.json()
	return new Response(JSON.stringify(data), {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

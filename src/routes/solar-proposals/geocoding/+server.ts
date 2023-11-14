import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { lat, lon } = await request.json()
	const res = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyD0mi2qm_Ig4ppWNoVV0i4MXaE5zgjIzTA`,
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

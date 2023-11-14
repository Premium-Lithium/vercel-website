import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 })
	const { left, bottom, right, top } = await request.json()
	const res = await fetch(
		`https://api.openstreetmap.org/api/0.6/map?bbox=${left},${bottom},${right},${top}.json`,
		{ method: 'GET', headers: { Accept: 'application/json' } }
	)
	const data = await res.text()
	return new Response(data, {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

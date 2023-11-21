import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ status: 400, message: 'No body provided' })
	const { openSolarId } = await request.json()

	let res = await fetch(
		`https://api.opensolar.com/api/orgs/99066/projects/${openSolarId}/systems/details`,
		{
			method: 'GET',
			headers: {
				Authorization: 'Bearer s_IK65BN2IG56EVZ2GSH5NI5APGMKBCY5H',
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
			}
		}
	)

	if (!res.ok) return json({ status: 400, message: res.statusText })

	let data = await res.json()
	return new Response(JSON.stringify(data), {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

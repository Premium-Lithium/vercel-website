import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ status: 400, message: 'No body provided' })
	const { project } = await request.json()
	let postcode = project.address.split(', ').at(-1)
	let res = await fetch(`https://api.opensolar.com/api/orgs/52668/projects/`, {
		method: 'POST',
		headers: {
			Authorization: 'Bearer s_IK65BN2IG56EVZ2GSH5NI5APGMKBCY5H',
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
		},
		body: JSON.stringify({
			identifier: project.projectId,
			lat: project.latLon.lat,
			lon: project.latLon.lon,
			address: project.address,
			zip: postcode,
			notes: `userId: ${project.uniqueIdentifier}`,
			country_iso2: 'GB'
		})
	})

	if (!res.ok) return json({ status: 400, message: res.statusText })

	let data = await res.json()
	return new Response(JSON.stringify(data), {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

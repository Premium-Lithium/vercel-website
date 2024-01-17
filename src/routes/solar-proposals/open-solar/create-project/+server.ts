import {
	PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN,
	PUBLIC_OPEN_SOLAR_TOKEN,
	PUBLIC_OPEN_SOLAR_ORG_ID
} from '$env/static/public'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ status: 400, message: 'No body provided' })
	let { project, openSolarOrgId, postcode } = await request.json()
	if (!postcode) {
		postcode = project.address.split(', ').at(-2).split(' ')
	}
	postcode = `${postcode[1]} ${postcode[2]}`
	let res = await fetch(`https://api.opensolar.com/api/orgs/${openSolarOrgId}/projects/`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${
				openSolarOrgId == PUBLIC_OPEN_SOLAR_ORG_ID
					? PUBLIC_OPEN_SOLAR_TOKEN
					: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN
			}`,
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

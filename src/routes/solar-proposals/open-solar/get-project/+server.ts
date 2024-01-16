import {
	PUBLIC_OPEN_SOLAR_ORG_ID,
	PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN,
	PUBLIC_OPEN_SOLAR_TOKEN
} from '$env/static/public'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ status: 400, message: 'No body provided' })
	const { project, openSolarOrgId } = await request.json()

	let res = await fetch(
		`https://api.opensolar.com/api/orgs/${openSolarOrgId}/projects/${project.id}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${
					openSolarOrgId == PUBLIC_OPEN_SOLAR_ORG_ID
						? PUBLIC_OPEN_SOLAR_TOKEN
						: PUBLIC_OPEN_SOLAR_SOLAR_PROPOSAL_TOKEN
				}`,
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

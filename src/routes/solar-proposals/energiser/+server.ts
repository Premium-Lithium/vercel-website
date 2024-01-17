import { PUBLIC_AWS_PRODUCTION_URL } from '$env/static/public'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	if (!request.body) return json({ status: 400, message: 'No body provided' })
	const { jobId } = await request.json()

	let res = await fetch(`${PUBLIC_AWS_PRODUCTION_URL}/design-completed`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'job_id': jobId
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

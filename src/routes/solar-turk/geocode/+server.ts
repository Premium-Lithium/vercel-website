export async function POST({ request }) {
	if (!request.body) return json({ message: 'Request needs a body' }, { status: 400 });
	const { addr } = await request.json();
	const res = await fetch(`https://geocode.maps.co/search?q=${addr}`, { method: 'GET' });
	const data = await res.json();
	return new Response(data, {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

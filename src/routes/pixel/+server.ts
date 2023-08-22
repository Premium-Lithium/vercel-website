export function GET(req, res) {
    const id = req.url.searchParams.get('id');

    const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    );

    console.log("user", id, "clicked on email");

	return new Response(pixel, {
		headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'private, no-cache, no-cache=Set-Cookie, proxy-revalidate',
            'Expires': '0',
            'Pragma': 'no-cache'
		}
	});
}
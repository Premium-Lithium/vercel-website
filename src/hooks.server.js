/** @type {import('@sveltejs/kit').Handle} */

import { ADMIN_LOGIN, ACADEMY_LOGIN } from '$env/static/private';

export async function handle({
    event,
    resolve,
}) {
    const url = new URL(event.request.url);

    const urlsRequiringAuth = ['/map','/brochure'];
    if (urlsRequiringAuth.some(x => url.pathname.startsWith(x))) {
        const auth = event.request.headers.get("Authorization");

        if ((url.pathname.startsWith('/map') && auth !== `Basic ${btoa(ADMIN_LOGIN)}`) ||
            (url.pathname.startsWith('/brochure') && auth !== `Basic ${btoa(ACADEMY_LOGIN)}`)) {
            return new Response("Not authorized", {
                status: 401,
                headers: {
                    "WWW-Authenticate":
                        'Basic realm="User Visible Realm", charset="UTF-8"',
                },
            });
        }
    }

    return resolve(event);
}


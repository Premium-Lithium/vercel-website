/** @type {import('@sveltejs/kit').Handle} */

import { ADMIN_LOGIN, ACADEMY_LOGIN } from '$env/static/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({
    event,
    resolve,
}) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event,
    });

    event.locals.getSession = async () => {
        const {
            data: { session }
        } = await event.locals.supabase.auth.getSession();
        return session;
    }



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

    return resolve(event, {
        filterSerializedReponseHeaders(name) {
            return name === "content-range";
        }
    });
}


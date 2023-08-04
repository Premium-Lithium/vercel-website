import type { Handle } from "@sveltejs/kit";
import { ADMIN_LOGIN } from "$env/static/private";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createSupabaseServerClient } from "@supabase/auth-helpers/sveltekit"

export async function handle({
    event,
    resolve,
}: Parameters<Handle>[0]): Promise<ReturnType<Handle>> {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event,
    });

    event.locals.getSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession()
        return session;
    }


    const url = new URL(event.request.url);

    console.log(url.pathname)
    if (url.pathname.startsWith("/map")) {
        const auth = event.request.headers.get("Authorization");

        if (auth !== `Basic ${btoa(ADMIN_LOGIN)}`) {
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
        },
    });
}

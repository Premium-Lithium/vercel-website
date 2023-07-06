// hooks.ts
import type { Handle } from "@sveltejs/kit";
import { ADMIN_LOGIN } from "$env/static/private";

export async function handle({
    event,
    resolve,
}: Parameters<Handle>[0]): Promise<ReturnType<Handle>> {
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

    return resolve(event);
}

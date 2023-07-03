// const ADMIN_LOGIN = "admin:occupa*tionPr$ofessi_onTra2#nsition";
const ADMIN_LOGIN = process.env.ADMIN_LOGIN;

export async function handle({
    event,
    resolve,
}) {
    const url = new URL(event.request.url);

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
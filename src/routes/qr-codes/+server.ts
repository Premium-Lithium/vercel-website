import { json } from "@sveltejs/kit";
const domain = "http(s)://api.qrserver.com/v1/create-qr-code/?data="

export async function GET({ request }) {
    const qrReq = await request.json()
    const qrRes = await fetch(domain+qrReq+"&bgcolor=255-255-255&qzone=4&format=svg");

    return qrRes;
}


// API endpoint for fetching data from matomo

import { json, type RequestHandler } from "@sveltejs/kit";
import { matomoAPICall } from "./matomoQuery.server";

export const POST: RequestHandler = async ({ request }) => {
    const params: Array<Array<string>> = await request.json()
    // make a call to matomo API for whatever data is asked for 

    const data = await matomoAPICall(params)
    return json(data)
};
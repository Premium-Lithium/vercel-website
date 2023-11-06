// get all the juicy data from matomo

import type { PageServerLoad } from "./$types";
import { matomoAPICall } from "./matomoQuery.server";



// have inital load, and some actions to load extra data
export const load: PageServerLoad = async ({params}) => {
    // construct basic query
    let queryparams = [
        ["method", "API.get"],
        ["idSite", "1"],
        ["period", "week"],
        ["date", "yesterday"],
        ["format", "JSON"],

    ];
    console.log("what?")
    const data = await matomoAPICall(queryparams)
    return {
        post: data,
    }
}


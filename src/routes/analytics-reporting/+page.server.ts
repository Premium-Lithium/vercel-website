// get all the juicy data from matomo

import type { PageServerLoad } from "./$types";
import { MATOMO_API_KEY } from "$env/static/private";


// have inital load, and some actions to load extra data

export const load: PageServerLoad = async ({params}) => {
    return {
        post: {
            test: "test1",
            content: "sample content",
        }
    }
}

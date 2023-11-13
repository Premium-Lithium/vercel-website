import { MATOMO_API_KEY } from "$env/static/private";

const baseURL = "https://energiser.matomo.cloud/index.php?module=API"



export function genQueryString(baseURL: string, params: Array<Array<string>>) {
    let paramList: Array<string> = [baseURL];
    for (const param of params) {
        paramList.push(param.join("="));
    }
    const queryString = paramList.join("&");
    return queryString;
}

// make the call to the API
export async function matomoAPICall (queryparams: Array<Array<string>>) {

    // add auth string
    queryparams.push(["token_auth", MATOMO_API_KEY]);

    const queryString = genQueryString(baseURL, queryparams);
    const res = await fetch(queryString);
    const data = await res.json();
    return data;
}
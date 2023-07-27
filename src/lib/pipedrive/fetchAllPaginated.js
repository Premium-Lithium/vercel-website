
export default async function fetchAllPaginated({
    url,
    start = 0,
    limit = 100,
    queryParams = [],
} = {}) {
    const queryParamsString = queryParams
        .concat([`start=${start}`, `limit=${limit}`])
        .join('&');

    const fullUrl = `${url}?${queryParamsString}`
    const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });

    const data = await response.json();

    if (!(data["additional_data"].pagination["more_items_in_collection"])) return data.data;

    return data.data.concat(await fetchAllPaginated({
        "url": url,
        "start": start + limit,
        "queryParams": queryParams
    }))
}


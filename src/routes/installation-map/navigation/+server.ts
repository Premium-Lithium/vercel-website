
const domain = "https://api.mapbox.com/optimized-trips/v1/"

/**
 * 
 * @param request body of a request with 
 * profile:mapbox/driving-traffic 
 * coordinates [{lon, lat}] 
 * source: first
 * TODO test and validation
 */
export async function GET({ request }) {
    let req = {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    };
    let res = await fetch(domain, req);
    return res.json();
}
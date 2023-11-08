export async function POST ({ request }) {
    const { postcode } = await request.json()
    let res = await fetch(`http://www.ssen.co.uk/distributor-results/Index?distributorTerm=${postcode}`)

    let match;
    try {
        const regex = /<dd class="c-results-list__value">(.*?)<\/dd>/;
        match = regex.exec(await res.text())?.[0];
    }
    catch {
        {} // Do nothing
    }

    return ((match !== undefined) ? new Response(JSON.stringify(match?.slice(34, -5))) : new Response(JSON.stringify("Network Operator not found")))
}
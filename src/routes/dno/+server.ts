export async function POST ({ request }) {
    const { postcode } = await request.json()
    console.log(postcode)
    let res = await fetch(`http://www.ssen.co.uk/distributor-results/Index?distributorTerm=${postcode}`)

    var regex = /<dd class="c-results-list__value">(.*?)<\/dd>/;
    var match = regex.exec(await res.text())?.[0];

    return new Response(JSON.stringify(match?.slice(34, -5)));
}
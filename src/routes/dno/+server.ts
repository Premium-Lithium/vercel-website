export async function GET() {
    let res = await fetch("http://www.ssen.co.uk/distributor-results/Index?distributorTerm=YO26+4UP")

    var regex = /<dd class="c-results-list__value">(.*?)<\/dd>/;
    var match = regex.exec(await res.text())?.[0];

    return new Response(JSON.stringify(match?.slice(34, -5)));
}
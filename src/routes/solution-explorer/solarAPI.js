const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
  };

export async function queryPV(lat, lon, peakPower, loss) {
    console.log("sending req")
    let res = fetch('https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=53.95924825020342&lon=-1.0772513524147558&peakpower=8.8&loss=14', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
    return res;
}
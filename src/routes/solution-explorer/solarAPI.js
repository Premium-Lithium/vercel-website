const options = {
    method: 'GET',
    headers: {
      cookie: 'jrc_cookie=!%2Fpq4dgpKzCu4IC5V4sOiVqlGd4BvI1Bdj7Bso9xVClNrOCdwQfqbHd2IrSKGCOdy%2BOXYCvPNW5YhS5g%3D; TS01316d01=01f4fc03dd0d75ac8e9e777318dec4d8c81637e059ee1f6a6bdaa3982cb721d5f75602d88e38d426af2cdea302da4aef95e01017c0',
      'Content-Type': 'application/json',
      'mode': 'no-cors',
    },
  };

export async function queryPV(lat, lon, peakPower, loss) {
    console.log("sending req")
    let res = await fetch(`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${loss}`, options)
    res = await res.json();
    return res;
}
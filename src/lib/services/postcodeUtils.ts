import chunkArray from "$lib/services/separateArrayIntoChunks"

export async function getBatchLatLonFromPostcodesWrapper(postcodes) {
  const postcodeChunks = chunkArray(postcodes, 100);
  const latLons = await Promise.all(postcodeChunks.map(async (postcodeChunk) => await fetchBatchLatLonFromPostcodes(postcodeChunk)));
  const allLatLons = Object.assign({}, ...latLons);

  const lengths = Object.keys(allLatLons).length

  return allLatLons;
}

async function fetchBatchLatLonFromPostcodes(postcodes) {
  if (postcodes.length > 100) throw new Error("postcodes.io cannot be sent more than 100 postcodes at a time")

  const url = 'https://api.postcodes.io/postcodes';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postcodes }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();
  const results = responseData.result;
  const output = {}

  for (const p of results) {
    const postcodeData = p.result;

    if (postcodeData === null)
      continue;

    const latitude = postcodeData.latitude;
    const longitude = postcodeData.longitude;

    if(latitude === null || longitude === null)
      continue;

    output[p.query] = { latitude, longitude };
  }

  return output;
}

export function extractPostcodeFrom(address) {
  if (address === null || address === undefined) {
    return null;
  }

  const postcodePattern = /[A-Z][A-HJ-Y]?\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2}/i;
  const postcodeRe = new RegExp(postcodePattern);
  const match = address.match(postcodeRe);

  if (match === null) {
    return null;
  } else {
    return match[0];
  }
}

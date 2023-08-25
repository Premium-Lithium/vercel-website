import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils';

// TODO - implement endpoint validation

const schema = {
    "type": "object",
    "properties": {
        "requestType": {
        "type": "string",
        "enum": ["PVGIS"]
        },
        "lat": {
        "type": "number"
        },
        "lon": {
        "type": "number"
        },
        "peakPower": {
        "type": "number"
        },
        "loss": {
        "type": "number"
        }
    },
    "required": ["requestType", "lat", "lon", "peakPower", "loss"]
}

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
  };

export async function POST({request}) {
    let requestData = await request.json();
    validate(requestData, schema);
    if(requestData.requestType != 'PVGIS') return json({message: "Unexpected endpoint"}, {status: 400});
    let lat = requestData.lat;
    let lon = requestData.lon;
    let peakPower = requestData.peakPower;
    let loss = requestData.loss;
    let res = await fetch(`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${loss}&outputformat=json`, options)
    return res;
}
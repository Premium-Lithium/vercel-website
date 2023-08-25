import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils';

// TODO - implement endpoint validation

const schema = {
    "type": "object",
    "properties": {
        "requestType": {
        "type": "string",
        "enum": ["PVGIS"],
        "errorMessage": "requestType should be one of ['PVGIS']",
        },
        "lat": {
        "type": "number",
        "maximum": 90,
        "minimum": -90,
        "errorMessage": "lat should be between -90 and 90"
        },
        "lon": {
        "type": "number",
        "maximum": 180,
        "minimum": -180,
        "errorMessage": "lon should be between -180 and 180"
        },
        "peakPower": {
        "type": "number",
        "minimum": 0,
        "errorMessage": "peakPower should be a positive number"        
        },
        "loss": {
        "type": "number",
        "minimum": 0,
        "maximum": 100,
        "errorMessage": "loss should be between 0 and 100."
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
    const validationErrors = validate(requestData, schema);
    if(validationErrors.length) {
        const errors = validationErrors.join(", ");
        return json({ message: `${errors}` }, { status: 400 })
    }
    if(requestData.requestType != 'PVGIS') return json({message: "Unexpected endpoint"}, {status: 400});
    let lat = requestData.lat;
    let lon = requestData.lon;
    let peakPower = requestData.peakPower;
    let loss = requestData.loss;
    let res = await fetch(`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${loss}&outputformat=json`, options)
    return res;
}
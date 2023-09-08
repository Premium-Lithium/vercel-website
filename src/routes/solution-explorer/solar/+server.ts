import { json } from '@sveltejs/kit';
import validate from '$lib/validation-utils';
import { GOOGLE_API_KEY } from '$env/static/private';

// TODO - implement endpoint validation

const schema = {
    "type": "object",
    "properties": {
        "requestType": {
        "type": "string",
        "enum": ["PVGIS", "GoogleSolar"],
        "errorMessage": "requestType should be a string.",
        },
        "lat": {
        "type": "number",
        "maximum": 90,
        "minimum": -90,
        "errorMessage": "lat should be between -90 and 90."
        },
        "lon": {
        "type": "number",
        "maximum": 180,
        "minimum": -180,
        "errorMessage": "lon should be between -180 and 180."
        },
        "peakPower": {
        "type": "number",
        "minimum": 0,
        "errorMessage": "peakPower should be a positive number."        
        },
        "loss": {
        "type": "number",
        "minimum": 0,
        "maximum": 100,
        "errorMessage": "loss should be between 0 and 100."
        },
        "angle": {
        "type": "number",
        "minimum": 0,
        "maximum": 90,
        "errorMessage": "angle should be between 0 and 90."
        },
        "azimuth": {
        "type": "number",
        "minimum": -180,
        "maximum": 180,
        "errorMessage": "angle should be between -180 and 180."
        },
    },
    if: {properties: {requestType: {"const": "PVGIS"}}},
    then: {"required": ["requestType", "lat", "lon", "peakPower", "loss"]},
    else: {"required": ["requestType", "lat", "lon"]}
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
    let res = undefined;
    if(validationErrors.length) {
        const errors = validationErrors.join(", ");
        return json({ message: `${errors}` }, { status: 400 })
    }
    if(requestData.requestType == 'PVGIS') {
        let lat = requestData.lat;
        let lon = requestData.lon;
        let peakPower = requestData.peakPower;
        let loss = requestData.loss;
        let angle = requestData.angle;
        let azimuth = requestData.azimuth;
        res = await fetch(`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${loss}&angle=${angle}&aspect=${azimuth}&outputformat=json`, options);
        return res;
    }
    else if(requestData.requestType == "GoogleSolar") {
        let lat = requestData.lat;
        let lon = requestData.lon;
        res = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&requiredQuality=HIGH&key=${GOOGLE_API_KEY}`, options);
        return(new Response(JSON.stringify(await res.json())));
    }
    else {
        return json({message: "Unexpected endpoint"}, {status: 400});
    }
    
}

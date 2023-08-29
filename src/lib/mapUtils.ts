import fetchAllPaginated from '$lib/pipedrive/fetchAllPaginated';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

/**
 * Returns a string representation of an array of coordinates.
 * @param {Array<Array<[Number, Number]>>} coords A 2D array of x y coordinates.
 * @return {string} A comma separated string containing each x y coordinate.
 */
export const serializeCoordinates = (coords: [[Number, Number]]) => {
    return coords.reduce(
        (acc, cv, ci, arr) => {
            return `${acc}${ci === 0 ? '' : ','}${cv[0].toString()},${cv[1].toString()}`;
        }, ""
    )
}

/**
 * Takes a string representing coordinates and returns a 2D array representation.
 * @param {string} coordString A comma seperated string containing each x y coordinate.
 * @returns {Array<[Number, Number]>} A 2D array of x y coordinates
 */
export const deserializeCoordinates = (coordString: String) => {
    let coordSplit = coordString.split(',').map(x => parseFloat(x));
    let coords = [];
    for(let i = 0; i < coordSplit.length; i+=2) {
        coords.push([coordSplit[i], coordSplit[i+1]]);
    }
    return coords;


}

export function splitArrayIntoNLengthChunks(inputArray: Array<any>, n: Number) {
    return inputArray.reduce((all,one,i) => {
        const ch = Math.floor(i/n); 
        all[ch] = [].concat((all[ch]||[]),one); 
        return all
    }, [])
}

/**
 * Gets the latitude and longitude for each postcode in an array.
 * @param {Array<string>} postcodes An array of postcodes.
 * @returns
 */
export async function fetchLatlonFromPostcodesPostcodes(postcodes: Array<String>) {
    const postcodeChunks = splitArrayIntoNLengthChunks(postcodes, 90);
    const locationChunks = await Promise.all(postcodeChunks.map(async (postcodeChunk) => {
        const postcodeResponse = await fetch('https://api.postcodes.io/postcodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "postcodes": postcodeChunk })
        });

        const postcodeData = await postcodeResponse.json();
        const filteredPostcodeData = postcodeData.result.filter(item => item.result !== null);
        return filteredPostcodeData

    }));

    return locationChunks.reduce((x, y) => x.concat(y));
}

export async function fetchInstallerDataFromPipedrive() {
    const data = await fetchAllPaginated({
        url: 'https://api.pipedrive.com/api/v1/organizations',
        queryParams: ['filter_id=115', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851'],
    })
    return fetchRelevantData(data, "installer");
}


const postcodeIndex = '80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code'

export async function fetchJobDataFromPipedrive() {
    const data = await fetchAllPaginated({
        url: 'https://api.pipedrive.com/api/v1/deals',
        queryParams: ['filter_id=55', 'api_token=77a5356773f422eb97c617fd7c37ee526da11851'],
    })
    return fetchRelevantData(data, "job");
}

export async function fetchRelevantData(data, type) {
    const filteredData = data.filter(item => item[postcodeIndex] !== null);
    const postcodes = filteredData.map(item => item[postcodeIndex]).slice(0)
    const locationData = await fetchLatlonFromPostcodesPostcodes(postcodes);


    // Match job data with postcode data

    return locationData.map((data) => {
        const postcode = data.query;
        const correspondingDatum = filteredData.find((x) => x[postcodeIndex] === postcode);
        return {
            ...correspondingDatum,
            ...data.result,
            name: correspondingDatum.title,
            type,
        };
    }) 
}

/**
 * @param point A Turf.js point.
 * @param polygons A list of Turf.js polygons.
 * @returns The first index of polygons which the point is inside.
 */
export function pointInPolygonFromList (point, polygons) {
    for (let i = 0; i < polygons.length; i++) {
        if (booleanPointInPolygon(point, polygons[i])) {
            return i;
        }
    }
    return null;
}
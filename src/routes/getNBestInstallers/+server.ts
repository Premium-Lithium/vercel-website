import { getNBestInstallersForJob } from '$lib/services/installerMatching.js'

export async function GET(request, response) {
    // TODO: reimplement for supabase

    const jobPostcode = request.body.postcode;
    const jobLatLon = await getLatLonFromPostcode(request.body.postcode);

    const numOffersPerJob = request.body.numOffersPerJob;
    const bestInstallers = getNBestInstallersForJob(
        jobLatLon,
        numOffersPerJob, installers
    );
    
    response.status(500).json(undefined);
}

async function getLatLonFromPostcode(postcode) {
    const url = `https://api.postcodes.io/postcodes/${postcode}`;
    const options = {
      method: 'GET',
    };

    const response = await fetch(url, options);
    const responseData = await response.json()
    return {
        latitude: responseData.result.latitude,
        longitude: responseData.result.longitude,
    }
}


import { PrismaClient } from "@prisma/client";
import { getNBestInstallersForJob } from '../../../lib/services/installerMatching.js'

const prisma = new PrismaClient();

export async function GET(request, response) {
    const installers = await prisma.installer.findMany();

    const jobPostcode = request.body.postcode;
    const jobLatLon = await getLatLonFromPostcode(request.body.postcode);

    const numOffersPerJob = request.body.numOffersPerJob;
    const bestInstallers = getNBestInstallersForJob(
        jobLatLon,
        numOffersPerJob, installers
    );
    
    response.status(200).json(bestInstallers);
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


import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD:src/routes/api/getNBestInstallers/+server.ts
import { getNBestInstallersForJob } from '../../../lib/services/installerMatching.js'
=======
import { getNBestInstallersForJob } from '../../services/installerMatching.js'
>>>>>>> b3367500cf3048961562b4c9d90480bcc0ef7cf4:src/routes/getNBestInstallers/+server.ts

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


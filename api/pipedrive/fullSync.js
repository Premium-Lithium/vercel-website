import prisma from '../src/lib/prisma.js'


export default async function (request, response) {
  if (request.method !== 'POST')
    return response.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests

  const updatedDb = await syncDatabaseWithPipedrive();

  if(!updatedDb)
    return response.status(500).json({ message: 'Failed to update database.' }); // Only allow POST requests

  return response.status(200).json({ message: 'Created new deals.' });
}

export async function syncDatabaseWithPipedrive() {
  var success = true;

  try {
    console.log("Syncing installer data...")
    await syncInstallers();

    console.log("Syncing job data...")
    await syncJobs();
  } catch (error) {
    console.error('Error fetching or storing data:', error);
    success = false;
  }

  return success
}

async function syncInstallers() {
  const installers = await getInstallerDataFromPipedrive();

  const operations = installers.map((installer) => {
    installer.address = installer.address === null ? "NA" : installer.address;
    installer.postcode = installer.postcode === null ? "NA" : installer.postcode;

    let { id, ...installer_data } = installer;

    return prisma.installer.upsert({
      where: { id: installer.id },
      update: installer_data,
      create: installer
    });
  });

  await prisma.$transaction(operations);
}

async function getInstallerDataFromPipedrive() {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  const filterId = 115;
  const url = `https://api.pipedrive.com/api/v1/organizations?api_token=${apiToken}&filter_id=${filterId}&limit=500`;

  const response = await fetch(url);
  const responseData = await response.json();

  if (!responseData.success) {
    return [];
  }

  // TODO: inteligently loop depending on the amount of paginated data
  const response2 = await fetch(`${url}&start=500`)
  const responseData2 = await response2.json();

  const orgs = responseData.data.concat(responseData2.data);

  var installers = orgs.map(org => ({
    id: org.id,
    name: org.name,
    address: org.address,
    postcode: extractPostcodeFrom(org.address),
    latitude: 0.0,
    longitude: 0.0,
    isPartner: false
  }));

  await assignLatLonPointsTo(installers);

  return installers;
}

function extractPostcodeFrom(address) {
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

async function assignLatLonPointsTo(entities) {
  const postcodes = entities.map(entity => entity.postcode);
  const latLonData = await getBatchLatLonFromPostcodesWrapper(postcodes).catch(err => console.error(err));

  for(var e of entities) {
    if(latLonData && e.postcode in latLonData && latLonData[e.postcode] !== null) {
      const loc = latLonData[e.postcode];

      e.latitude = loc.latitude;
      e.longitude = loc.longitude;
    }
  }
}

async function getBatchLatLonFromPostcodesWrapper(postcodes) {
  const postcodeChunks = chunkArray(postcodes, 100);
  const latLons = await Promise.all(postcodeChunks.map(async (postcodeChunk) => await getBatchLatLonFromPostcodes(postcodeChunk)));
  const allLatLons = Object.assign({}, ...latLons);

  return allLatLons;
}

function chunkArray(myArray, chunkSize) {
    if (!myArray.length) {
        return [];
    }
    const result = [myArray.slice(0, chunkSize)].concat(chunkArray(myArray.slice(chunkSize), chunkSize));
    return result
}

async function getBatchLatLonFromPostcodes(postcodes) {
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

async function syncJobs() {
  const jobs = await getJobDataFromPipedrive();

  const operations = jobs.map((job) => {
    job.address = job.address === null ? "NA" : job.address;
    job.postcode = job.postcode === null ? "NA" : job.postcode;

    let { id, ...job_data } = job;

    return prisma.job.upsert({
      where: { id: job.id },
      update: job_data,
      create: job
    });
  });

  await prisma.$transaction(operations);
}

async function getJobDataFromPipedrive() {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  const filterId = 127;
  const url = `https://api.pipedrive.com/api/v1/persons?api_token=${apiToken}&filter_id=${filterId}&limit=500`;

  const response = await fetch(url);
  const responseData = await response.json();

  if (!responseData["success"]) {
    return [];
  }

  // TODO: inteligently loop depending on the amount of paginated data
  const response2 = await fetch(`${url}&start=500`)
  const responseData2 = await response2.json();

  const jobData = responseData.data.concat(responseData2.data);

  const jobs = jobData.map(job => {
    const addressData = job['b26fd49521a6b948ba52ffd45566f7a229b3c896'];

    return {
      id: job.id,
      customerName: job.name,
      address: addressData,
      postcode: extractPostcodeFrom(addressData),
      latitude: 0.0,
      longitude: 0.0
    };
  });

  await assignLatLonPointsTo(jobs);

  return jobs;
}
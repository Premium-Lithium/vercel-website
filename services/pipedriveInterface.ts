// Responsible for updating the database given the state of pipedrive.
import { Installer, Job, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


async function getInstallerDataFromPipedrive() {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  const filterId = 115;
  const url = `https://api.pipedrive.com/api/v1/organizations?api_token=${apiToken}&filter_id=${filterId}`;

  const response = await fetch(url);
  const responseData = await response.json();

  if (!responseData.success) {
    return [];
  }

  const orgs = responseData.data;

  const installers: Installer[] = orgs.map(org => ({
    id: org.id,
    name: org.name,
    address: org.address,
    postcode: extractPostcodeFrom(org.address),
    latitude: 0.0,
    longitude: 0.0,
    isPartner: false
  }));

  const postcodes: string[] = installers.map(inst => inst.postcode);
  const latLonData = await getBatchLatLonFromPostcodes(postcodes).catch(err => console.error(err));

  for(var i of installers) {
    if(i.postcode in latLonData) {
      const loc = latLonData[i.postcode];

      i.latitude = loc.latitude;
      i.longitude = loc.longitude;
    }
  }

  return installers;
}


function extractPostcodeFrom(address: string): string | null {
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


interface Location {
  latitude: number;
  longitude: number;
}

async function getBatchLatLonFromPostcodes(postcodes: string[]): Promise<{ [postcode: string]: Location }> {
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


  const output: { [postcode: string]: Location } = {};

  for (const p of results) {
    const postcodeData = p.result;

    if (postcodeData === null) {
      continue;
    }

    const latitude = postcodeData.latitude;
    const longitude = postcodeData.longitude;

    output[p.query] = { latitude, longitude };
  }

  return output;
}


async function getJobDataFromPipedrive() {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  const filterId = 127;
  const url = `https://api.pipedrive.com/api/v1/persons?api_token=${apiToken}&filter_id=${filterId}`;

  const response = await fetch(url);
  const responseData = await response.json();

  if (!responseData["success"]) {
    return [];
  }

  const jobData = responseData.data;

  const jobs: Job[] = jobData.map(job => {
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

  const postcodes: string[] = jobs.map(customer => customer.postcode);
  const latLonData = await getBatchLatLonFromPostcodes(postcodes).catch(err => console.error(err));

  for(var j of jobs) {
    if(j.postcode in latLonData) {
      const loc = latLonData[j.postcode];

      j.latitude = loc.latitude;
      j.longitude = loc.longitude;
    }
  }

  return jobs;
}

async function syncInstallers() {
  const installers = await getInstallerDataFromPipedrive();

  const operations = installers.map((installer) => {
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

export async function syncDatabaseWithPipedrive() {
  try {

    // await syncInstallers();
    await syncJobs();

  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}
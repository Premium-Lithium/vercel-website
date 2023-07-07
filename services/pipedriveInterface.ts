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
  console.log(postcodes);

  const latLonData = await getBatchLatLonFromPostcodes(postcodes).catch(err => console.error(err));
  console.log(latLonData);

  for(var i of installers) {
    if(i.postcode in latLonData) {
      const loc = latLonData[i.postcode];

      i.latitude = loc.latitude;
      i.longitude = loc.longitude;
    }
  }

  console.log(installers);

  return installers;
}


function extractPostcodeFrom(address: string): string | null {
  if (address === null) {
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
  const pipelineId = 115;
  const url = `https://api.pipedrive.com/api/v1/pipelines/${pipelineId}/deals?api_token=${apiToken}`;

  const response = await fetch(url);
  const responseData = await response.json();

  if (!responseData["success"]) {
    return [];
  }

  const jobData = responseData.data;

  // TODO: get latitude and longitude
  let latitude = 15.0;
  let longitude = 30.0;

  const jobs: Job[] = jobData.map(job => ({
    id: job.id,
    customerName: job.name,
    // address: job.address,
    address: job.f88008b8bc920032167c0bd9a0015fe280f062a6,
    postcode: job['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code']
  }));

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

  console.log(jobs);

  // const operations = jobs.map((job) => {
  //   job.address = job.address === null ? "NA" : job.address;
  //   job.postcode = job.postcode === null ? "NA" : job.postcode;

  //   let { id, ...job_data } = job;

  //   return prisma.job.upsert({
  //     where: { id: job.id },
  //     update: job_data,
  //     create: job_data
  //   });
  // });

  // await prisma.$transaction(operations);
}

async function syncDeals() {
  // todo
}

export async function syncDatabaseWithPipedrive() {
  try {

    await syncInstallers();
    // await syncJobs();
    // await syncDeals();

  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}
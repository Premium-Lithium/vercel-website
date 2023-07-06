// Responsible for updating the database given the state of pipedrive.
import axios from 'axios';
import { Installer, Job, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const PIPEDRIVE_API_TOKEN ='77a5356773f422eb97c617fd7c37ee526da11851'

export async function getInstallerDataFromPipedrive() {
  const response = await axios.get('https://api.pipedrive.com/api/v1/organizations', {
      params: { api_token: PIPEDRIVE_API_TOKEN, filter_id: 115 },
  });

  const responseData = response.data;

  if (!responseData["success"]) {
    return [];
  }

  const orgs = responseData.data;

  console.log(orgs);

  // TODO: get latitude and longitude
  let latitude = 90.0;
  let longitude = 100.0;

  const installers: Installer[] = orgs.map(org => ({
    id: org.id,
    name: org.name,
    address: org.address,
    postcode: org.address_postal_code,
    latitude: latitude,
    longitude: longitude,
    isPartner: false
  }));

  return installers;
}

export async function getJobDataFromPipedrive() {
  try {
    console.log("getting job data from pipedrive...");

    const response = await axios.get('https://api.pipedrive.com/api/v1/pipelines/23/deals', {
      params: { api_token: PIPEDRIVE_API_TOKEN }
    });

    console.log("done");
    const responseData = response.data;

    if (!responseData["success"]) {
      return [];
    }

    const jobData = responseData.data;

    // TODO: get latitude and longitude
    let latitude = 15.0;
    let longitude = 30.0;

    const jobs: Job[] = jobData.map(job => ({
      id: job.id,
      // customerName: job.name,
      customerName: job.person_name,
      // address: job.address,
      address: job.f88008b8bc920032167c0bd9a0015fe280f062a6,
      postcode: job['80ebeccb5c4130caa1da17c6304ab63858b912a1_postal_code'],
      latitude: latitude,
      longitude: longitude
    }));

    console.log(jobs);

    return jobs;

  } catch (error) {
    console.error(error);
  }
}

async function syncInstallers() {
  const installers = await getInstallerDataFromPipedrive();

  const operations = installers.map((installer) => {
    installer.postcode = installer.postcode === null ? "NA" : installer.postcode;

    let { id, ...new_details } = installer;

    return prisma.installer.upsert({
      where: { id: installer.id },
      update: installer,
      create: new_details
    })
  });

  await prisma.$transaction(operations);
}

async function syncJobs() {
  const jobs = await getJobDataFromPipedrive();

  if(jobs === undefined)
    return;

  const operations = jobs.map((job) => {
    console.log(job.customerName);

    job.postcode = job.postcode === null ? "NA" : job.postcode;
    job.address = job.address === null ? "NA" : job.address;

    let { id, ...new_details } = job;

    return prisma.job.upsert({
      where: { id: job.id },
      update: job,
      create: new_details
    })
  });

  await prisma.$transaction(operations);
}

async function syncDeals() {
  // todo
}

export async function syncDatabaseWithPipedrive() {
  try {
    console.log("synchronising database with pipedrive...");

    // await syncInstallers();
    await syncJobs();
    // await syncDeals();

  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}
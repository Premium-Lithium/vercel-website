import { PrismaClient, DealStatus } from '@prisma/client';
import { syncDatabaseWithPipedrive } from './pipedrive/fullSync.js';


const prisma = new PrismaClient();


const DEFAULT_NUM_INSTALLERS = 5;


export default async function (request, response) {
  console.log("Running installer matching...")
  if (request.method !== 'POST') // TODO: change to POST
    return response.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests

  const jobId = request.body.id;

  if(!jobId)
    return response.status(500).json({ message: 'No job id provided.' });

  await syncDatabaseWithPipedrive();

  var numInstallers = request.body.numInstallers;

  if(!numInstallers)
    numInstallers = DEFAULT_NUM_INSTALLERS;

  console.log("finding ", numInstallers, " installers");

  await matchInstallersTo(jobId, numInstallers);

  return response.status(200).json({ message: 'Created new deals.' });
}

async function matchInstallersTo(jobId, n) {
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  console.log("job", job);

  if(job === null) {
    throw new Error(`Job with id ${jobId} not found.`);
    console.log("Failed to find job with id", jobId);
  }

  console.log("Fetching all installers...");
  const allInstallers = await prisma.installer.findMany();

  const installerScores = allInstallers.map(installer => ({installer, score: compatibility(installer, job)}));

  installerScores.sort((a, b) => b.score - a.score);

  const bestScores = installerScores.slice(0, n);
  const bestInstallers = bestScores.map(item => item.installer);

  const operations = bestInstallers.map(installer => {
    return prisma.deal.upsert({
      where: {
        jobId_installerId: {
          jobId: job.id,
          installerId: installer.id,
        },
      },
      update: {},
      create: {
        jobId: job.id,
        installerId: installer.id,
        status: DealStatus.PENDING
      }
    });
  });

  console.log("Upserting deals...");
  await prisma.$transaction(operations);
}


function compatibility(installer, job) {
  const lat1 = installer.latitude;
  const lon1 = installer.longitude;
  const lat2 = job.latitude;
  const lon2 = job.longitude;

  return -getDistanceFromLatLonInM(lat1, lon1, lat2, lon2);
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371000; // Radius of the earth in meters
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);

  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in meters

  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
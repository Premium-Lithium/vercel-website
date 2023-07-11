import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncDatabaseWithPipedrive } from '../services/pipedriveInterface.js'
import { PrismaClient, Installer, Job, Deal } from '@prisma/client';


const prisma = new PrismaClient();


const DEFAULT_NUM_INSTALLERS = 5;


export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST')
    return response.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests

  const updatedDb = await syncDatabaseWithPipedrive();

  if(!updatedDb)
    return response.status(500).json({ message: 'Failed to update database.' }); // Only allow POST requests

  const job = request.body.job;

  if(!job)
    return response.status(500).json({ message: 'No job information supplied.' });

  var numInstallers = request.body.numInstallers;

  if(!numInstallers)
    numInstallers = DEFAULT_NUM_INSTALLERS;

  await matchInstallersTo(job, numInstallers);

  return response.status(200).json({ message: 'Created new deals.' });
}

async function matchInstallersTo(job: Job, n: number) {
  const allInstallers = await prisma.installer.findMany();
  const installerScores = allInstallers.map(installer => ({installer, score: compatibility(installer, job)}));

  installerScores.sort((a, b) => b.score - a.score);

  const bestScores = installerScores.slice(0, n);
  const bestInstallers = bestScores.map(item => item.installer);

  // Add each installer <-> job pair to the database as a deal that uses the unique installer-job pair as the id
  const operations = bestInstallers.map(installer => {
    return prisma.deal.create({
      data: {
        jobId: job.id,
        installerId: installer.id,
        accepted: false // or set some default/initial value
      }
    });
  });

  await prisma.$transaction(operations);
}


function compatibility(installer: Installer, job: Job): number {
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
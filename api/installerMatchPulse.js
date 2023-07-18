import { DealStatus } from '@prisma/client';
import { getNBestInstallersForJob } from '../src/services/installerMatching.js'
import prisma from '../src/lib/prisma.js'


const NUM_OFFERS = 10;


export default async function (request, response) {
  console.log("Fetching all installers...");
  const installers = await prisma.installer.findMany();

  console.log(installers[0].id);

  console.log("Finding all jobs without deals...");
  const notInDeals = await allJobsNotInDeals();

  const operations = [];

  console.log("Iterating through each job and matching it to installers...");
  for(const job of notInDeals) {
    const bestInstallers = getNBestInstallersForJob(job, NUM_OFFERS, installers);

    const upsertions = bestInstallers.map(installer => {
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

    operations.push(...upsertions);
  }

  console.log("Performing ", operations.length, " upsertions.");
  await prisma.$transaction(operations);

  return response.status(200).json({ message: 'Created new deals.' });
}


async function allJobsNotInDeals() {
  const jobs = await prisma.job.findMany({
    where: {
      Deals: {
        none: {}
      }
    }
  });

  return jobs
}
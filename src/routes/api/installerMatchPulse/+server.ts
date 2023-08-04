import { DealStatus } from '@prisma/client';
import { getNBestInstallersForJob } from '../../../services/installerMatching.js'
import prisma from '../../../lib/prisma.js'


const NUM_OFFERS_PER_JOB = 10;
const NUM_JOBS_MATCHED_PER_API_CALL = 100; // This is to avoid 60s timeout on Vercel pro plan


export async function GET(request, response) {
  console.log("Fetching all installers...");
  const installers = await prisma.installer.findMany();

  console.log("Finding all jobs without deals...");
  const notInDeals = await allJobsWithoutDeals();
  const batch = notInDeals.slice(0, NUM_JOBS_MATCHED_PER_API_CALL);

  const operations = [];

  console.log("Iterating through each job and matching it to installers...");
  for(const job of batch) {
    const bestInstallers = getNBestInstallersForJob(job, NUM_OFFERS_PER_JOB, installers);

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


async function allJobsWithoutDeals() {
  const jobs = await prisma.job.findMany({
    where: {
      Deals: {
        none: {}
      }
    }
  });

  return jobs
}
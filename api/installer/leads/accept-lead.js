import { DealStatus } from "@prisma/client"
import prisma from '../../../../../lib/prisma.js'


export default async function (request, response) {
  const json = JSON.parse(request.body)
  const dealId = json.deal_id;

  const deal = await prisma.deal.findUnique({
    where: {
      id: dealId,
    },
    select: {
      id: true,
      status: true,
      Job: {
        select: {
          numQuotes: true,
          Deals: {
            select: {
              id: true,
              status: true,
            }
          }
        }
      }
    }
  });

  if (deal.status !== DealStatus.PENDING)
    return response.status(400).json({ message: 'Deal is not pending. Can only accept pending deals.' });

  const numQuotesNeeded = deal.Job.numQuotes;
  const otherDealsOnThisJob = deal.Job.Deals.filter(d => d.id !== deal.id);
  const numAcceptedDeals = otherDealsOnThisJob.filter(d => d.status === DealStatus.ACCEPTED).length;

  if(numAcceptedDeals >= numQuotesNeeded)
    return response.status(400).json({ message: 'This job has already received enough quotes.' });

  if(!await acceptDeal(dealId))
    return response.status(400).json({ message: 'Failed to accept deal.' });

  // If the total number of accepted deals now we've accepted this one is
  // sufficient, then we need to expire all other non-accepted deals
  if(numAcceptedDeals + 1 >= numQuotesNeeded) {
    const dealsUpdated = await expirePending(otherDealsOnThisJob);

    if(!dealsUpdated)
      return response.status(500).json({ message: 'Failed to expire pending deals.' });
  }

  return response.status(200).json({ message: 'Successfully accepted deal.' });
}


async function acceptDeal(dealId) {
  console.log("Accepting deal " + dealId);

  var success = true;

  try {
    await prisma.deal.update({
      where: {
        id: dealId
      },
      data: {
        status: DealStatus.ACCEPTED,
      },
    });
  } catch (error) {
    success = false;
  }

  return success;
}


async function expirePending(deals) {
  const pendingDealIds = deals.filter(d => d.status === DealStatus.PENDING).map(d => d.id);
  console.log("Expiring pending deals:", pendingDealIds);

  var success = true;

  try {
    await prisma.deal.updateMany({
      where: {
        id: {
          in: pendingDealIds,
        },
      },
      data: {
        status: DealStatus.EXPIRED,
      },
    });
  } catch (error) {
    success = false;
  }

  return success;
}
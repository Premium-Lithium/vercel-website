import { PrismaClient, DealStatus } from "@prisma/client"


const prisma = new PrismaClient()


export default async function (request, response) {
  const dealId = request.body.deal_id;

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

  // Rare edge case where someone has accepted this deal before we could update it
  if(numAcceptedDeals >= numQuotesNeeded)
    return response.status(400).json({ message: 'This job has already received enough quotes.' });

  // Accept this deal
  acceptDeal(dealId);

  // If the total number of accepted deals now we've accepted this one is sufficient, then we need to expire all other non-accepted deals
  if(numAcceptedDeals + 1 >= numQuotesNeeded)
    expirePending(otherDealsOnThisJob);

  return response.status(200).json({ message: 'Successfully updated installer data.' });
}


async function acceptDeal(dealId) {
  console.log("Accepting deal: ", dealId);

  const result = await prisma.deal.update({
    where: {
      id: dealId
    },
    data: {
      status: DealStatus.ACCEPTED,
    },
  });

  // TODO: add return code here
}


async function expirePending(deals) {
  const pendingDealIds = deals.filter(d => d.status === DealStatus.PENDING).map(d => d.id);
  console.log("Expiring deals: ", pendingDealIds);

  const result = await prisma.deal.updateMany({
    where: {
      id: {
        in: pendingDealIds,
      },
    },
    data: {
      status: DealStatus.EXPIRED,
    },
  });

  // TODO: add return code here
}
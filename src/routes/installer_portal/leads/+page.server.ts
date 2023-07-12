import { DealStatus } from '@prisma/client';
import prisma from '$lib/prisma';

function censorPostcode(postcode) {
    return postcode
        .match(/^[A-Z][A-HJ-Y]?[0-9][A-Z0-9]?/i);
}

function censorName(name) {
    const firstName = name.split(" ")[0];
    if (firstName === name) return undefined;
    return firstName;
}

function censorSensitiveJobInfo(job) {
    return {
        id: job.id,
        customerName: censorName(job.customerName),
        postcode: censorPostcode(job.postcode),
    }
}

export const load = async () => {
    console.log("Loading installer portal page...");

    const response = await prisma.installer.findUnique({
        where: {
            id: 7448
        },
        include: {
            deals: {
                where: {
                    status: { not: DealStatus.REJECTED },
                },
                include: {
                    Job: true,
                },
            },
        },
    });

    console.log(response);

    // console.log(response.Deals)


    response.deals.forEach((deal) => {
        if (deal.status === DealStatus.ACCEPTED) return;
        deal.Job = censorSensitiveJobInfo(deal.Job)
    })

    return {data:response};
}


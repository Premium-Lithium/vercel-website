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

    const response = await prisma.Installer.findUnique({
        where: {
            id: 1
        },
        include: {
            Deals: {
                where: {
                    status: { not: DealStatus.REJECTED },
                },
                include: {
                    Job: true,
                },
            },
        },
    });

    console.log(response.Deals)


    response.Deals.forEach((deal) => {
        if (deal.status === DealStatus.ACCEPTED) return;
        deal.Job = censorSensitiveJobInfo(deal.Job)
    })

    return {data:response};
}


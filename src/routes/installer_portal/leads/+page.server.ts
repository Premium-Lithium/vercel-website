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
    console.log("Trying to find installer with id 2766...");
    const response = await prisma.installer.findUnique({
        where: {
            id: 2766
        },
        include: {
            Deals: {
                where: {
                    status: { not: 'REJECTED' },
                },
                include: {
                    Job: true,
                },
            },
        },
    });


    console.log(response);

    response.Deals.forEach((deal) => {
        if (deal.status === 'ACCEPTED')
            return;

        deal.Job = censorSensitiveJobInfo(deal.Job)
    })

    return {data:response};
}


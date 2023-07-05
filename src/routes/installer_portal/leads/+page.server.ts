import prisma from '$lib/prisma';

export const load = async () => {

    const response = await prisma.Job.findMany({
        select: {
            Deals: {
                select: {
                    id: true,
                    accepted: true,
                },
            },
            address: true,
        },
        where: {
            Deals: {
                some: {
                    installerId: 1
                },
            },
        },
    })
    return { jobs: response };
}


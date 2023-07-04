import prisma from '$lib/prisma';

export const load = async () => {
    const response = await prisma.Job.findMany({
        select: {
            Deal: {
                select: {
                    id: true,
                    accepted: true,
                },
            },
            address: true,
        },
        where: {
            Deal: {
                some: {
                    installerId: 1
                },
            },
        },
    })
    return { jobs: response };
}


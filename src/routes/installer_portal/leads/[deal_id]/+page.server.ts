import prisma from '$lib/prisma';

export const load = async ({ params: { deal_id } }) => {
    const response = await prisma.Job.findMany({
        select: {
            Deal: {
                select: {
                    id: true,
                },
            },
            address: true,
        },
        where: {
            Deal: {
                some: {
                    installerId: 3
                },
            },
        },
    })
    return { deal_id };
}


import prisma from '$lib/prisma';

export const load = async ({ params: { deal_id } }) => {
    const response = await prisma.Deal.findUnique({
        where: {
            id: parseInt(deal_id),
        },
        include: {
            Job: true,
        },
    })
    return { deal_id, data: response };
}


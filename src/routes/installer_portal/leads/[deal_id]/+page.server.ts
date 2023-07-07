import prisma from '$lib/prisma';

export const load = async ({ params: { deal_id } }) => {
    const dealInt = parseInt(deal_id)
    const response = await prisma.Deal.findUnique({
        where: {
            id: dealInt,
        },
        include: {
            Job: true,
        },
    })
    return { deal_id: dealInt, data: response };
}


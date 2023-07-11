import { DealStatus } from '@prisma/client';
import prisma from '$lib/prisma';

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

    return {data:response};
}


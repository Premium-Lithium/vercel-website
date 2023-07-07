import prisma from '$lib/prisma';

export const load = async () => {

    const response = await prisma.Installer.findUnique({
        where: {
            id: 1
        },
        include: {
            Deals: {
                include: {
                    Job: true,
                },
            },
        },
    });

    return {data:response};
}


import { PrismaClient, DealStatus } from "@prisma/client"

const prisma = new PrismaClient()

export default async function (request, response) {
    const json = JSON.parse(request.body)
    const dealId = json.deal_id;

    const result = await prisma.deal.updateMany({
        where: {
            id: dealId,
            status: DealStatus.PENDING,
        },
        data: {
            status: DealStatus.REJECTED,
        },
    })

    return response.status(200).json({ message: 'Successfully updated installer data.' });
}
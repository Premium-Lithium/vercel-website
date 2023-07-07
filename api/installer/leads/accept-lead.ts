import { PrismaClient } from "@prisma/client"
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient()

export default async function (request: VercelRequest, response: VercelResponse) {
    const json = JSON.parse(request.body)
    const dealId = json.deal_id;

    const result = await prisma.deal.update({
        where: {
            id: dealId,
        },
        data: {
            accepted: true,
        },
    })

    return response.status(500)
}


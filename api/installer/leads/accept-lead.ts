import { PrismaClient } from "@prisma/client"
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient()

export default async function (request: VercelRequest, response: VercelResponse) {
    console.log("client asked to accept lead");
    console.log(request.body);
    const json = JSON.parse(request.body)
    const dealId = json.deal_id;
    console.log(dealId);

    const result = await prisma.deal.update({
        where: {
            id: dealId,
        },
        data: {
            accepted: true,
        },
    })

    return response.send("yo")
}


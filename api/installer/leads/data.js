import { PrismaClient, DealStatus } from "@prisma/client";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import util from "util";

const prisma = new PrismaClient();
const jwksUri = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/.well-known/jwks.json";

export default async function (request, response) {
    const accessToken = request?.headers?.authorization;

    if (accessToken === undefined) return;

    const userinfoAuthUrl = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/userinfo";

    const res = await fetch(userinfoAuthUrl, {
        method: 'GET',
        headers: {
            Authorization: accessToken,
        },
    })

    try {
        const result = res.json()
        const returnData = load(result['http://localhost:3000/userdata'].installerId)
        response.status(200).json(returnData)

    } catch (e) {
        response.status(400).json({nope: "my dude"})
    }
    console.log(await res.text())



}

async function load(id) {
    console.log("Trying to find installer with id ", id);

    try {
        const response = await prisma.installer.findUnique({
            where: {
                'id': id
            },
            include: {
                Deals: {
                    where: {
                        status: { not: 'REJECTED' },
                    },
                    include: {
                        Job: true,
                    },
                },
            },
        });
        if (response === undefined) {
            return {
                data: null
            }
        }
        response.Deals.forEach((deal) => {
            if (deal.status === 'ACCEPTED')
                return;
        
            deal.Job = censorSensitiveJobInfo(deal.Job)
        })
        return {data: response.json()};
    } catch(e) {
        console.log("We avoided the error!\n", e);
        return {
            data: null
        }
    }


}


import { PrismaClient, DealStatus } from "@prisma/client";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import util from "util";

const prisma = new PrismaClient();
const jwksUri = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/.well-known/jwks.json";

export default async function (request, response) {
    const accessToken = request?.headers?.authorization;
    if (accessToken === undefined) return;

    console.log(accessToken)
    const tokenData = await getAccessTokenDataOrFalse(accessToken)
    if (!tokenData) return reponse.status(400).json({error: "unauthorized"})
    console.log("tokendata", tokenData)

    const returnData = await load(tokenData['http://localhost:3000/userdata'].installerId)
    console.log("about to return", returnData)
    response.status(200).json(returnData)
}

async function getAccessTokenDataOrFalse(token) {
    const userinfoAuthUrl = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/userinfo";
    const res = await fetch(userinfoAuthUrl, {
        method: 'GET',
        headers: {
            Authorization: token,
        },
    })

    try {
        return await res.json()
    } catch (e) {
        return false;
    }
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
        return {data: response};
    } catch(e) {
        console.log("We avoided the error!\n", e);
        return {
            data: null
        }
    }
}

function censorPostcode(postcode) {
    let censored = postcode
        .match(/^[A-Z][A-HJ-Y]?[0-9][A-Z0-9]?/i);
    return censored ? censored : "null";
}

function censorName(name) {
    const firstName = name.split(" ")[0];
    if (firstName === name) return undefined;
    return firstName;
}

function censorSensitiveJobInfo(job) {
    return {
        id: job.id,
        customerName: censorName(job.customerName),
        postcode: censorPostcode(job.postcode),
    }
}

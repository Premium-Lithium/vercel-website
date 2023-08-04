import { PrismaClient, DealStatus } from "@prisma/client";
import { json } from '@sveltejs/kit';
const prisma = new PrismaClient();
const authTenantUrl = process.env.AUTH0_TENANT_URL

export default async function (request, response) {
    console.log("fired")
    const accessToken = request?.headers?.authorization;
    if (accessToken === undefined) return;

    const proto = request.headers['x-forwarded-proto'];
    const host = request.headers['x-forwarded-host'];
    const tokenData = await getAccessTokenDataOrFalse(accessToken)
    if (!tokenData) return json({status:400, error:"unauthorized"})

    const returnData = await loadOrUndefined(tokenData[`${proto}://${host}/userdata`].installerId)
    if (returnData === undefined) return json({status:500, error: "could not get data"});

    return json({
        status: 200,
        headers: {
            "Content-Type": "application/csv",
            "Content-Disposition": `attatchment; filename*=unsubed.csv`
        },
        body: returnData
    });
    // return response.status(200).json(returnData);
}

async function getAccessTokenDataOrFalse(token) {
    const userinfoAuthUrl = `${authTenantUrl}/userinfo`;
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

async function loadOrUndefined(id) {
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
        if (response === undefined) return undefined;

        response.Deals.forEach((deal) => {
            if (deal.status === 'ACCEPTED')
                return;
            deal.Job = censorSensitiveJobInfo(deal.Job)
        })
        return {data: response};
    } catch(e) {
        return undefined;
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


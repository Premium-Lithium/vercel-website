import prisma from '$lib/prisma';

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

export const load = async () => {
//    console.log("Trying to find installer with id 1510...");
//
//    try {
//        const response = await prisma.installer.findUnique({
//            where: {
//                id: 1510
//            },
//            include: {
//                Deals: {
//                    where: {
//                        status: { not: 'REJECTED' },
//                    },
//                    include: {
//                        Job: true,
//                    },
//                },
//            },
//        });
//        if (response === undefined) {
//            return {
//                data: null
//            }
//        }
//        response.Deals.forEach((deal) => {
//            if (deal.status === 'ACCEPTED')
//                return;
//        
//            deal.Job = censorSensitiveJobInfo(deal.Job)
//        })
//        return {data: response};
//    } catch(e) {
//        console.log("We avoided the error!\n", e);
//        return {
//            data: null
//        }
//    }


}


import { PrismaClient, DealStatus } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const installers = await prisma.Installer.createMany({
        data: [
            {
                id: 1,
                name: 'test jeff',
                isPartner: false,
                address: "University of York",
                postcode: "yo10 5dd",
                latitude: 53.9484132,
                longitude: -1.0561402,
            },
        ]
    });
    const jobs = await prisma.Job.createMany({
        data: [
            {
                id: 1,
                customerName: "Wattkins",
                address: "The Groves",
                postcode: "yo26 5FB",
                latitude: 53.9658984,
                longitude: -1.1247931,
            },
            {
                id: 2,
                customerName: "Bobo",
                address: "Lloyd Land Rover",
                postcode: "yo30 4XB",
                latitude: 53.9901377,
                longitude: -1.0995922,
            },
        ]
    });
    const deals = await prisma.Deal.createMany({
        data: [
            {
                id: 1,
                jobId: 1,
                installerId: 1,
                status: DealStatus.PENDING,
            },
            {
                id: 2,
                jobId: 2,
                installerId: 1,
                status: DealStatus.PENDING,
            },
        ]
    });
};
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });


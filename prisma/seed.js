import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const jeff = await prisma.Installer.createMany({
        data: [
            {
                id: 2,
                name: 'test jeff',
                isPartner: false,
                address: "University of York",
                postcode: "yo10 5dd",
                latitude: "53.9484132",
                longitude: "-1.0561402",
            },
        ]
    })
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


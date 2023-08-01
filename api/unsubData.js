import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function GET(request, response) {
    const unsubed = await prisma.unsubscribedEmails.findMany();
    const unsubcolumns = ['email', 'reason']
    const unsubedData = `${unsubcolumns.join(',')}\n${unsubed
        .map((row) => unsubcolumns.map((col) => row[col]).join(','))
        .join('\n')}`;
    console.log(unsubedData);
    response.writeHead(200, { 'Content-Type': 'apllication/json' });
    response.end(unsubedData);
    return response;
}

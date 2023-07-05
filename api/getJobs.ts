import { PrismaClient } from "@prisma/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";


const prisma = new PrismaClient();


export default async function (request: VercelRequest, response: VercelResponse) {
  try {
    // Fetch all installers
    const jobs = await prisma.installer.findMany();

    response.status(200).json(jobs);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
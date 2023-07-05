import { PrismaClient } from "@prisma/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const prisma = new PrismaClient();

export default async function (request: VercelRequest, response: VercelResponse) {
  const { name, isPartner, address, postcode, latitude, longitude } = request.body;

  // Input validation - add more if needed
  if (!name || !address || !postcode || !latitude || !longitude) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a new Installer
    const installer = await prisma.installer.create({
      data: {
        isPartner: isPartner || false, // defaults to false if not provided
        address,
        postcode,
        latitude,
        longitude,
      }
    });

    response.status(200).json(installer);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
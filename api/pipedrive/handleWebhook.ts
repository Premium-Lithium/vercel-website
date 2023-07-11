import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Installer, Job, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export default async function (request: VercelRequest, response: VercelResponse) {
  console.log("Syncing installer data...");

  if (request.method !== 'GET')
    return response.status(405).json({ message: 'Method not allowed' });

  const update = request.body;
  if (update.meta.object == "organization") {
    var installer = {
      id: update.current.id,
      address: update.current., // todo
      postcode: update.current.,

    };

    return prisma.installer.upsert({
      where: { id: installer.id },
      update: installer_data,
      create: installer
    });

    await prisma.$transaction(operations);

  }
  else if (update.meta.object == "deal") {

  }

  var success = true;

  try {
    // TODO: take update information from parameter and use it to update the database

    // await prisma.job.update({
    // TODO
    // });
  } catch (error) {
    console.error('Error fetching or storing data:', error);
    success = false;
  }

  if(!success)
    return response.status(500).json({ message: 'Failed to update installer data.' });

  return response.status(200).json({ message: 'Successfully updated installer data.' });
}

async function syncInstallerData(todo_installerUpdateData) {
}

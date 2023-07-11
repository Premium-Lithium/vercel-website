import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Installer, Job, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export default async function (request: VercelRequest, response: VercelResponse) {
  console.log("Syncing installer data...");

  if (request.method !== 'GET')
    return response.status(405).json({ message: 'Method not allowed' });

  console.log(request);

  // TODO: extract relevant update information from request body and pass this to syncInstallerData()
  const todo_updateData = { "todo": "todo" }
  var success = await syncInstallerData(todo_updateData);

  if(!success)
    return response.status(500).json({ message: 'Failed to update installer data.' });

  return response.status(200).json({ message: 'Successfully updated installer data.' });
}

async function syncInstallerData(todo_installerUpdateData) {
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

  return success;
}

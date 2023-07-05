// Responsible for updating the database given the state of pipedrive.
// There's only a subset of information on Pipedrive we actually care about for
// the installer <-> customer matching algorithm.
import axios from 'axios';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export async function getInstallerDataFromPipedrive() {
  const response = await axios.get('https://api.pipedrive.com/api/v1/organizations', {
      params: {
          api_token: '77a5356773f422eb97c617fd7c37ee526da11851',
          filter_id: 115
      }
  });

  const responseData = response.data;

  if (!responseData["success"]) {
    return [];
  }
  const orgs = responseData.data;

  // TODO: get latitude and longitude
  let latitude = '0.0';
  let longitude = '1.0';

  type Installer = {
      id: number;
      name: string;
      address: string;
      postcode: string;
      latitude: number;
      longitude: number;
      isPartner: boolean;
  };

  const installers: Installer[] = orgs.map(org => ({
    // In pipedrive
    id: org.id,
    name: org.name,
    address: org.address,
    // postcode: org.address_postal_code,
    postcode: 'postcode here',

    // Not in pipedrive
    latitude: latitude,
    longitude: longitude,
    isPartner: false
  }));

  return installers;
}

export async function syncDatabaseWithPipedrive() {
  try {
    const installers = await getInstallerDataFromPipedrive();

    const promises = installers.map((installer) =>
        prisma.installer.upsert({
            where: { id: installer.id },
            update: installer,
            create: installer,
        }),
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}
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
  let latitude = 90.0;
  let longitude = 100.0;

  type Installer = {
      id: number;
      name: string;
      address: string;
      postcode: string;
      latitude: string;
      longitude: string;
      isPartner: boolean;
  };

  const installers: Installer[] = orgs.map(org => ({
    // In pipedrive
    id: org.id,
    name: org.name,
    address: org.address,
    postcode: org.address_postal_code,

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

    // const user = await prisma.installer.updateMany({
    //   data: {
    //     postcode: "NEW POSTCODE HERE"
    //   }
    // })

    const operations = installers.map((installer) =>
      prisma.installer.updateMany({
        where: { id: installer.id },
        data: {
          postcode: "bob"
        }
      })
    );
    await prisma.$transaction(operations);

  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}
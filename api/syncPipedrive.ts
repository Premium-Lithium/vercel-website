// Temporary endpoint for manually triggering pipedrive fetch
// import { getInstallerDataFromPipedrive } from '../services/pipedriveInterface.ts'
import { syncDatabaseWithPipedrive } from '../services/pipedriveInterface.ts'


export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await syncDatabaseWithPipedrive();

      // const data = await getInstallerDataFromPipedrive();
      // console.log(data);

      res.status(200).json({ message: 'Data fetched and stored successfully' });

    } catch (error) {
      console.error('Error fetching or storing data:', error);
      res.status(500).json({ message: 'An error occurred while fetching or storing data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests
  }
}
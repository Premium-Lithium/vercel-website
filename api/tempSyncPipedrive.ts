// Temporary endpoint for manually triggering pipedrive fetch
import { syncDatabaseWithPipedrive } from '../services/pipedriveInterface.js'

export default async function (req, res) {
  if (req.method === 'POST') {
    try {

      await syncDatabaseWithPipedrive();
      res.status(200).json({ message: 'Pipedrive sync was fine.' });

    } catch (error) {
      console.error('Error during Pipedrive sync:', error);
      res.status(500).json({ message: 'An error occurred while fetching or storing data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests
  }
}
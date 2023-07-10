import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncDatabaseWithPipedrive } from '../services/pipedriveInterface.js'


export default async function (request: VercelRequest, response: VercelResponse) {
  const json = JSON.parse(request.body)

  // TODO: extract relevant information from the request
  const dealId = json.deal_id;

  if (request.method === 'POST') {
    try {
      // 1. Make sure that we're dealing with the most up to date information from pipedrive
      const result = await syncDatabaseWithPipedrive();
      // TODO: check pipedrive update completed successfully

      // 2. Given pipedrive info, and the request params, work out which deals should be created
      // (nearest n installers matched to customer)
      const newDeals = calculateDeals();

      // 3. Add these new deals to the deals table
      addDealsToDB(newDeals);

      res.status(200).json({ message: 'Pipedrive sync was fine.', body: result });
    } catch (error) {
      console.error('Error during Pipedrive sync:', error);
      res.status(500).json({ message: 'An error occurred while fetching or storing data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // Only allow POST requests
  }
}
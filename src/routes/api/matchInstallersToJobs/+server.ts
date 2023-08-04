import { matchInstallersTo } from '../../../services/installerMatching.js'


const DEFAULT_NUM_INSTALLERS = 5;


export default async function (request, response) {
  console.log("Running installer matching...")
  if (request.method !== 'POST')
    return response.status(405).json({ message: 'Method not allowed' });

  const jobId = request.body.id;

  if(!jobId)
    return response.status(500).json({ message: 'No job id provided.' });

  var numInstallers = request.body.numInstallers;

  if(!numInstallers)
    numInstallers = DEFAULT_NUM_INSTALLERS;

  await matchInstallersTo(jobId, numInstallers);

  return response.status(200).json({ message: 'Created new deals.' });
}
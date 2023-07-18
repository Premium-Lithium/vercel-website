export function getNBestInstallersForJob(job, n, installers) {
  const installerScores = installers.map(installer => ({
    installer, score: compatibility(installer, job)
  }));
  installerScores.sort((a, b) => b.score - a.score);
  const bestScores = installerScores.slice(0, n);
  const bestInstallers = bestScores.map(item => item.installer);

  return bestInstallers;
}

function compatibility(installer, job) {
  const lat1 = installer.latitude;
  const lon1 = installer.longitude;
  const lat2 = job.latitude;
  const lon2 = job.longitude;

  return -getDistanceFromLatLonInM(lat1, lon1, lat2, lon2);
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371000; // Radius of the earth in meters
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);

  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in meters

  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
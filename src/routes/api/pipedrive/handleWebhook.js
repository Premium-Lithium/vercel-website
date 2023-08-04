export default async function (request, response) {
  const update = request.body;
  console.log(update);

  // if (update.meta.object == "organization") {
  //   console.log("Syncing organization data...");
  // }
  // else if (update.meta.object == "deal") {
  //   console.log("Syncing deal data...");
  // }
  // else {
  //   console.log("Unknown webhook type.");
  // }
}
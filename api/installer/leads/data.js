import { PrismaClient, DealStatus } from "@prisma/client";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import util from "util";

const prisma = new PrismaClient();
const jwksUri = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/.well-known/jwks.json";

export default async function (request, response) {
    console.log(request.headers.authorization)
    const accessToken = request?.headers?.authorization;

    if (accessToken === undefined) return;

    const userinfoAuthUrl = "https://dev-a8lw8imwybb5wby4.uk.auth0.com/userinfo";

    const tempAccessToken = "Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly9kZXYtYThsdzhpbXd5YmI1d2J5NC51ay5hdXRoMC5jb20vIn0..wpLmxQrMSWWyGbwQ.xxQDcRZ4X3DgE4PBj8iiHMsA-TUzFsIg0mmTk0ykXGaDRybSCekp1T6q3RiCcRrQGpUvgbTII3619Zdb3owiHVnuB_TeNKvfWx8QQ0Wc4jHLQtIw60k3Dj4gyUsfivZl7NCn1TXLN_-xX_59CHpQQLSPq0jyJ89qc3Thjupqv74uZ-ACHFSuCLlQDTJjs-3aSlKDgclK-ezlmqE0NO-kDZSFsguhBURGcNCMXcjb8n7PlhbGr8cxQAOseDBxq3hs9j7S9E-jSDMrvmEbol_WQAZKJglZjBhGbiCjtUTaL3WRzhODI0tJXlhN3Axf4BFR8fyNLwRmxt23Lc4tUc_P2GHRoc3KpQE.REO3Tx_ZazjH6inE6pU0tA"

    const res = await fetch(userinfoAuthUrl, {
        method: 'GET',
        headers: {
            Authorization: accessToken,
        },
    })



    console.log(await res.text())



}


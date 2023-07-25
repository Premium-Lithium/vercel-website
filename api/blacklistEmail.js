import fs from 'fs';

const key = process.env.INTERNAL_API_KEY;

export default async function PUT(request, response) {
    if (request.headers.authorization !== `Bearer ${key}`) return response.status(401).json({message: "unauthorized"});

    const email = request.body.email;
    if (email === undefined) return response.status(400).json({
        error: "No 'email' field provided in the body",
    })

    const blacklistPath = "emailBlacklist.txt";
    fs.appendFile(blacklistPath, `${email}\n`, (err) => {
        if (err) {
            console.error("couldn't append to emailBlacklist.txt");
            return response.status(500).json({message: "internal server error"});
        } else {
            return response.status(200).json({message: "done"});
        }
    });
    return response.status(200).json({message: "done"});

}


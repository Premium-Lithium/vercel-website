import { json } from "@sveltejs/kit";
const url = 'https://qrcode-monkey.p.rapidapi.com/qr/custom';

export async function POST({ request }) {

    const data = await request.json()

    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '3ca4e3ad93msh88c8bfda74eede9p15e7f5jsncd24c2b319d1',
            'X-RapidAPI-Host': 'qrcode-monkey.p.rapidapi.com'
        },
        body: {
            data: data,
            size: 300,
            download: false,
            file: 'svg'
        }
    };
    let result;
    try {
        const response = await fetch(url, options);
        result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }

    return result;
}


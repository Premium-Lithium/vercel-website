import { json } from "@sveltejs/kit";

export async function POST ({request}){
    if(!request.body) return json({message: "Request needs a body"}, {status: 400});
    let data = await request.json();
    console.log(data.current.status, data.previous.status);
}
import { OPENAI_API_KEY, OPENAI_ORG_ID } from "$env/static/private";
import OpenAI from "openai";
import {json} from '@sveltejs/kit';

const openai = new OpenAI({
    organization: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
});


export async function POST({request}) {
    let form: FormData = await request.formData()
    let audioFile: File = form.entries().next().value[1];
    let res = undefined;
    try{
    res = await openai.audio.transcriptions.create({
        file: audioFile, 
        model: "whisper-1"
    });}
    catch (error) {
        return json({message: error}, {status: 500});
    }
    return json({message: res.text}, {status: 200});
    
}

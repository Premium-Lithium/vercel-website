import { OPENAI_API_KEY, OPENAI_ORG_ID } from "$env/static/private";
import OpenAI from "openai";
import {json} from '@sveltejs/kit';

const openai = new OpenAI({
    organization: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
});

const allowedFileTypes = ['wav', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'webm'].map((x) => {return `audio/${x}`});

export async function POST({request}) {
    if(!request.body)
        return json({ message: "No request body found" }, { status: 400 });
    let form: FormData;
    try{
        form = await request.formData()
    } catch (error) {
        return json({message: error}, {status: 400})
    }
    let content = form.entries().next().value;
    if(content.length != 2 || content[1].size == 0 || content[0] != 'audio' || !allowedFileTypes.includes(content[1].type)) {
        return json({message: "Form must contain a valid audio file."}, {status: 400});
    }
    let audioFile: File = content[1];
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

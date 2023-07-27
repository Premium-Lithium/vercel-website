import {OPENAI_API_KEY, OPENAI_ORG_ID} from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";
import {json} from '@sveltejs/kit';

export async function POST({ request }) {
    const { prompt } = await request.json();
    return json({message: await completion(prompt)}, {status: 200});
}



const configuration = new Configuration({
    organization: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = async (messages) => {
    let output = 
    await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
    });
    return(output.data.choices[0].message);
};


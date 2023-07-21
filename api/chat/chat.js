import {OPENAI_API_KEY, OPENAI_ORG_ID} from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const completion = async (prompt) => {
    let output = 
    await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        max_tokens: 1000,
        temperature: 0.7
    });
    return(output.data.choices[0].message);
};


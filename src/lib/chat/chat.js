import {OPENAI_API_KEY, OPENAI_ORG_ID} from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

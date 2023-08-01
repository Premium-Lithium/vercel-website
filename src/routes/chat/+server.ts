import {OPENAI_API_KEY, OPENAI_ORG_ID} from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";
import { json } from '@sveltejs/kit';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { onMount } from 'svelte';
import { writeFile } from 'fs';

const loader = new CheerioWebBaseLoader("https://premiumlithium.com/products/powerpod?_pos=1&_fid=0a2ecd092&_ss=c");
const data = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter( {
    chunkSize: 500,
    chunkOverlap: 0,
})

const splitDocs = await textSplitter.splitDocuments(data);

// We will want to store this embedding somewhere, and load it instead of creating it each time it's needed.
const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
// const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
// const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

var jsonVectorStore = JSON.stringify(vectorStore.toJSON());
writeFile("embeddings.txt", jsonVectorStore, function(err) {
    if(err) console.log(err);
});


export async function POST({ request }) {
    const { prompt } = await request.json();
    console.log(prompt[prompt.length-1]['content']);
    const response = await chain.call({
        query: prompt[prompt.length-1]['content']
    });
    console.log(response);
    return json({message: response}, {status: 200});
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


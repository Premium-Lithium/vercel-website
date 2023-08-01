import { OPENAI_API_KEY, OPENAI_ORG_ID, KV_URL } from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";
import { json } from '@sveltejs/kit';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { onMount } from 'svelte';
import { kv } from '@vercel/kv';
import { createClient, createCluster } from "redis";
import { Document } from 'langchain/document';

let chain;
let model;
let vectorStore;
const client = createClient({
    legacyMode: true,
    url: KV_URL ?? "redis://localhost:6379",
});
await client.connect();
if(true){
    // const loader = new CheerioWebBaseLoader("https://premiumlithium.com/products/powerpod?_pos=1&_fid=0a2ecd092&_ss=c");
    // const data = await loader.load();
    // const textSplitter = new RecursiveCharacterTextSplitter( {
    //     chunkSize: 500,
    //     chunkOverlap: 0,
    // })

    // const splitDocs = await textSplitter.splitDocuments(data);


    await client.connect();

    const docs = [
    new Document({
        metadata: { foo: "bar" },
        pageContent: "redis is fast",
    }),
    new Document({
        metadata: { foo: "bar" },
        pageContent: "the quick brown fox jumped over the lazy dog",
    }),
    new Document({
        metadata: { baz: "qux" },
        pageContent: "lorem ipsum dolor sit amet",
    }),
    new Document({
        metadata: { baz: "qux" },
        pageContent: "consectetur adipiscing elit",
    }),
    ];

    vectorStore = await RedisVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings(),
        {
            redisClient: client,
            indexName: "docs",
        }
    );

    await client.disconnect();
    // // We will want to store this embedding somewhere, and load it instead of creating it each time it's needed.
    // const embeddings = new OpenAIEmbeddings();
    // RedisVectorStore.fromDocuments(
    //     splitDocs, 
    //     embeddings, 
    //     {
    //         redisClient: client,
    //         indexName: "docs",
    //     }
    // );
    
    model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
    chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(1));
    await client.disconnect();
}

export async function POST({ request }) {
    await client.connect();
    console.log(client);
    try {
        const { prompt } = await request.json();
        console.log(prompt[prompt.length-1]['content']);
        const response = await chain.call({
            query: prompt[prompt.length-1]['content']
        });
        console.log(response);
        await client.disconnect();
        return json({message: response}, {status: 200});
    } catch (error)
    {
        console.log(error);
    }
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


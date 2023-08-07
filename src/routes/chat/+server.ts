import { OPENAI_API_KEY, OPENAI_ORG_ID, KV_URL } from '$env/static/private';
import { Configuration, OpenAIApi } from "openai";
import { json } from '@sveltejs/kit';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { createStructuredOutputChainFromZod } from "langchain/chains/openai_functions";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from 'langchain/memory';
import  { z } from 'zod';

const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question,
return the conversation history excerpt that includes any relevant context to the question if it exists
and rephrase the follow up question to be a standalone question.
If the conversation history is empty, greet the customer with a friendly emoji.
Chat History:
{chat_history}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of context to answer the users question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
<Relevant chat history excerpt as context here>
Standalone question: <Rephrased question here>
\`\`\`
Your answer:`;

const zodSchema = z.object({
    answer: z.string().describe("The answer to the user's query"),
    suggestions: z.array(
        z.object( {
        text: z.string().describe("A suggested follow-up question."),
    })).describe("An array of suggested follow-up questions."),
})

let chain;
let model;
let vectorStore;
if(true){
    // do embedding, we will want to store this at some point.
    const text = `SAVE UP TO 55% WITH A PRE-ORDER ON ALL PRODUCTS
    Choose your delivery date:
    
    JUN '24 | Save 55%
    
    -------------------------------------
    
    Faraday - Your Portable Powerhouse
    Sale price
    £313 (ex. VAT)
    Regular price
    £695
    
    Product power: 1.28kWh
    Nominal voltage: 12V (12.8V)
    Nominal capacity: 100Ah
    Dimensions: 330 x 172 x 217 mm
    Weight: 12kg
    
    --------------------------------------
    
    Edison - Power Meets Portability
    Sale price
    £628 (ex. VAT)
    Regular price
    £1,395
    
    Product power: 2.56kWh
    Nominal voltage: 12V (12.8V)
    Nominal capacity: 200Ah
    Dimensions: 521 x 238 x 218 mm
    Weight: 22kg
    
    --------------------------------------
    
    Franklin - Power Meets Portability
    Sale price
    £628 (ex. VAT)
    Regular price
    £1,395
    
    Product power: 2.56kWh
    Nominal voltage: 24V (25.6V)
    Nominal capacity: 100Ah
    Dimensions: 521 x 238 x 218 mm
    Weight: 22kg
    
    --------------------------------------
    
    Maxwell - Unrivalled Power
    Sale price
    £1,213 (ex. VAT)
    Regular price
    £2,695
    
    Product power: 5.12kWh
    Nominal voltage: 24V (25.6V)
    Nominal capacity: 200Ah
    Dimensions: 520 x 240 x 270 mm
    Weight: 42kg
    
    --------------------------------------
    
    Watson - Unrivalled Power
    Sale price
    £1,213 (ex. VAT)
    Regular price
    £2,695
    
    Product power: 5.12kWh
    Nominal voltage: 48V (51.2V)
    Nominal capacity: 100Ah
    Dimensions: 520 x 360 x 190 mm/
    Weight: 45kg/
    
    --------------------------------------/
`
    const textSplitter = new RecursiveCharacterTextSplitter( {
        chunkSize: 500,
        chunkOverlap: 0,
    })
    const docs = await textSplitter.createDocuments([text]);

    const splitDocs = await textSplitter.splitDocuments(docs);

    vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings(),
    );

    model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0, maxTokens: 250 });


    // let parser = new CustomListOutputParser({length: 3, separator: "|"});
    // const prompt = new ChatPromptTemplate({
    //     promptMessages: [ 
    //         SystemMessagePromptTemplate.fromTemplate("You are a helpful, friendly, upbeat customer assistant named Evie for one of the fastest growing\
    //         green energy companies in the UK: Premium Lithium, who provide integrated solutions\
    //         enabling energy dependence, from design, manufacturing and installation of\
    //         Smart Home Batteries, Solar Panels, EV Chargers, and UPS. Do your best to answer the above query, and then provide\
    //         3 follow up questions which the user may ask. {formatInstructions}"),
    //         // The customer will ask you questions, and your only goal is to provide them with the necessary\
    //         // information and ask them any essential follow up questions in order for them to choose which system\
    //         // to purchase. {formatInstructions} After each answer you should provide 3 follow up questions which the user may want to ask, based on their query.\n\
    //         // Here's an example of an initial prompt you should send:\
    //         // Hello, how can I assist you today?|I'd like to know about your solar panels|\
    //         // I'd like to know about your EV chargers|How much power would I get from solar panels on my roof?\n
    //         HumanMessagePromptTemplate.fromTemplate("{inputText}"),
    //     ],
    //     inputVariables: ["inputText"],
    //     partialVariables: {
    //         formatInstructions: parser.getFormatInstructions(),
    //     },
    // });    
    
    let conversationChain = ConversationalRetrievalQAChain.fromLLM(
        model, 
        vectorStore.asRetriever(),
        {
        memory: new BufferMemory({
            memoryKey: "chat_history",
            returnMessages: true,
        }),
        questionGeneratorChainOptions: {
            template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
        }
        },   
    );

    let outputChain = createStructuredOutputChainFromZod(zodSchema, {
        
        chatHistory: myChatHistory,
        question: myQuestion,
    })
}

export async function POST({ request }) {
    try {
        const { prompt } = await request.json();
        console.log(prompt[prompt.length-1]['content']);
        const response = await chain.call({
            question: prompt[prompt.length-1]['content']
        });
        console.log(response);
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
        max_tokens: 250,
        temperature: 0.05,
    });
    return(output.data.choices[0].message);
};


import { json } from '@sveltejs/kit';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { supabase } from '$lib/supabase';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from 'langchain/memory';
import { VectorDBQAChain } from 'langchain/chains';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools/calculator';
import { ChainTool } from 'langchain/tools';
import { Client } from 'langsmith';
import { LangChainTracer } from 'langchain/callbacks';
import { LANGCHAIN_API_KEY, LANGCHAIN_PROJECT, LANGCHAIN_ENDPOINT } from '$env/static/private';

// LANGSMITH
const client = new Client({
  apiUrl: LANGCHAIN_ENDPOINT,
  apiKey: LANGCHAIN_API_KEY,
})

const tracer = new LangChainTracer({
  projectName: LANGCHAIN_PROJECT,
  client
})

// LANGCHAIN
let model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0, maxTokens: 500 });

// Vector store for general knowledge base
let generalVectorStore = await new SupabaseVectorStore(
    new OpenAIEmbeddings(),
    {
        client: supabase,
        tableName: "evie_general_knowledge_base",
        queryName: "match_documents_general",
    },
);

// Vector store for pricing knowledge base
let pricingVectorStore = await new SupabaseVectorStore(
  new OpenAIEmbeddings(),
  {
      client: supabase,
      tableName: "evie_pricing_knowledge_base",
      queryName: "match_documents_pricing",
  },
);

let generalVectorStoreChain = VectorDBQAChain.fromLLM(model, generalVectorStore);

let pricingVectorStoreChain = VectorDBQAChain.fromLLM(model, pricingVectorStore);

const generalQATool = new ChainTool({
    name: "premium-lithium-general-qa",
    description: "Premium Lithium Knowledge Base QA - Useful for answering questions about products we offer, such as batteries, solar panels, inverters and EV chargers, aswell as general queries",
    chain: generalVectorStoreChain,
})

const productsQATool = new ChainTool({
  name: "premium-lithium-products-qa",
  description: "Premium Lithium Products Knowledge Base QA - Useful for answering questions about prices and specifications of our products, and payment queries",
  chain: pricingVectorStoreChain,
})

const tools = [
    new Calculator(),
    generalQATool,
    productsQATool,
];

const conversationMemory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
    inputKey: "input",
    outputKey: "output",
});

const agentExecutor = await initializeAgentExecutorWithOptions(tools, model,
    {
      agentType: "openai-functions",
      verbose: true,
      memory: conversationMemory,
      maxIterations: 8,
      agentArgs: {
        prefix: `You are a helpful assistant named Evie for the company Premium Lithium, one of the fastest growing UK smart energy companies.
        You should aim to provide concise responses.`
      }
    }
);

export async function POST({ request }) {
    try {
        const { prompt } = await request.json();
        const response = await agentExecutor.call({
            input: prompt[prompt.length-1]['content']
    }, {callbacks: [tracer]});
        return json({message: response, runId: response.__run}, {status: 200});
    } catch (error)
    {
        return json({message: error}, {status: 400});
    }
}
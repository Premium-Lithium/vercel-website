import { json } from '@sveltejs/kit';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { supabase } from '$lib/supabase';
import {BaseChatPromptTemplate,
        renderTemplate,
        type SerializedBasePromptTemplate} from 'langchain/prompts';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from 'langchain/memory';
import { LLMChain, VectorDBQAChain } from 'langchain/chains';
import { AgentActionOutputParser,
         AgentExecutor,
         LLMSingleActionAgent,} from "langchain/agents";
import { HumanMessage, 
         BaseMessage, 
         type AgentAction, 
         type AgentFinish, 
         type AgentStep, 
         type InputValues, 
         type PartialValues } from 'langchain/schema';
import type { Tool } from 'langchain/dist/tools/base';
import { Calculator } from 'langchain/tools/calculator';
import { ChainTool } from 'langchain/tools';

// BOILERPLATE 

const PREFIX = `You are Evie, a friendly customer assistant for Premium Lithium, a UK green energy company. 
You must attempt to answer the customer's query while also trying to progress the conversation, with the view to eventually recommend a product to the customer given their specific situation.
Answer the following questions as best you can. You have access to the following tools:`;
const formatInstructions = (
  toolNames: string
) => `Use the following format in your response:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolNames}, None] ** If None, you must provide a Final Answer **
Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Input/Observation can repeat N times.)
Final Answer: the output to the customer`;
const SUFFIX = `Begin!

Previous conversation history:
{history}

New question: {input}
{agent_scratchpad}`;


class CustomPromptTemplate extends BaseChatPromptTemplate {
    tools: Tool[];
  
    constructor(args: { tools: Tool[]; inputVariables: string[] }) {
      super({ inputVariables: args.inputVariables });
      this.tools = args.tools;
    }
  
    _getPromptType(): string {
      return "CustomPrompt";
    }
  
    async formatMessages(values: InputValues): Promise<BaseMessage[]> {
      /** Construct the final template */
      const toolStrings = this.tools
        .map((tool) => `${tool.name}: ${tool.description}`)
        .join("\n");
      const toolNames = this.tools.map((tool) => tool.name).join("\n");
      const instructions = formatInstructions(toolNames);
      const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
      /** Construct the agent_scratchpad */
      const intermediateSteps = values.intermediate_steps as AgentStep[];
      const agentScratchpad = intermediateSteps.reduce(
        (thoughts, { action, observation }) =>
          thoughts +
          [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
        ""
      );
      const newInput = { agent_scratchpad: agentScratchpad, ...values };
      /** Format the template. */
      const formatted = renderTemplate(template, "f-string", newInput);
      return [new HumanMessage(formatted)];
    }
  
    partial(_values: PartialValues): Promise<BaseChatPromptTemplate> {
      throw new Error("Not implemented");
    }
  
    serialize(): SerializedBasePromptTemplate {
      throw new Error("Not implemented");
    }
  }
  
  class CustomOutputParser extends AgentActionOutputParser {
    lc_namespace = ["langchain", "agents", "custom_llm_agent_chat"];
  
    async parse(text: string): Promise<AgentAction | AgentFinish> {
      if (text.includes("Final Answer:")) {
        const parts = text.split("Final Answer:");
        const input = parts[parts.length - 1].trim();
        const finalAnswers = { output: input };
        return { log: text, returnValues: finalAnswers };
      }
  
      const match = /Action: (.*)\nInput: (.*)/s.exec(text);
      if (!match) {
        throw new Error(`Could not parse LLM output: ${text}`);
      }
  
      return {
        tool: match[1].trim(),
        toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
        log: text,
      };
    }

    getFormatInstructions(): string {
        throw new Error("Not implemented");
    }
}

// END BOILERPLATE

let model;
let vectorStore;

model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0, maxTokens: 500 });

vectorStore = await new SupabaseVectorStore(
    new OpenAIEmbeddings(),
    {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
    },
);

let vectorStoreChain = VectorDBQAChain.fromLLM(model, vectorStore);

const qaTool = new ChainTool({
    name: "premium-lithium-qa",
    description: "Premium Lithium Knowledge Base QA - Useful for answering questions about products we offer, such as batteries, solar panels, inverters and EV chargers",
    chain: vectorStoreChain,
})

const tools = [
    new Calculator(),
    qaTool,
];
const prompt = new CustomPromptTemplate({
    tools: tools,
    inputVariables: ["input", "intermediate_steps", "history"],
});

let conversationChain = new LLMChain(
    {
        llm: model,
        prompt: prompt,
    }
);

const outputParser = new CustomOutputParser();

const agent = new LLMSingleActionAgent(
    {
        llmChain: conversationChain,
        outputParser: outputParser,
        stop: ['\nObservation:'],
    }
)

const conversationMemory = new BufferWindowMemory({
    k: 2
});

const agentExecutor = AgentExecutor.fromAgentAndTools(
    {
      agent,
      tools,
      verbose: true,
      memory: conversationMemory,
      maxIterations: 6,
    }
);

export async function POST({ request }) {
    try {
        const { prompt } = await request.json();
        const response = await agentExecutor.call({
            input: prompt[prompt.length-1]['content']
    });
        return json({message: response}, {status: 200});
    } catch (error)
    {
        return json({message: error}, {status: 400});
    }
}


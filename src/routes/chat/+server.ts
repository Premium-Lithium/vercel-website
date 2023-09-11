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



import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


var text = `

Save up to 55% with a preorder on all products with a 5% discount per month from now, capped at 55% when installing in 12 months from now. e.g - if it's currently January, a February installation would have a 5% discount, if it's currently March, a July installation would have a 20% discount.  

--- 

The price is not just for the battery but for a complete turnkey solution that includes everything you need to manage and reduce your energy costs. This solution includes full case management and application to the National Grid, your chosen Premium Lithium Smart Home Battery, a grade-A inverter, all wiring and mounting equipment, free delivery and installation by our team of experts as well as onboarding and off-site management. All hardware also comes with 10 years’ warranty for full peace of mind. 

If you already have solar panels, significant savings can be made with just a Smart Home Battery on its own. If you are considering solar panels for your home, then a Premium Lithium Smart Home Battery solution will allow you to store any excess solar energy for use after the sun sets. 

All Smart Home Battery solutions that are purchased include free delivery and installation. 

All our hardware and equipment come with a fully comprehensive 10-year warranty for your complete peace of mind. 

If you are looking to move house, many customers decide to sell the battery as part of the property. However, if you would like to take the smart battery with you, then for a nominal fee, we can send our team to uninstall the battery and assist in moving it to your new home. 

For our manufacturing, we maintain an exclusive partnership with Delong Energy Company. They might not be widely recognised online, but their reputation in quality production is unparalleled. 

The battery’s lifespan extends up to 37 years when cycled roughly 162 times per year (approximately every other day). This is a more realistic usage pattern than fully charging and discharging daily. Under ideal conditions, this battery promises long-term reliability and efficiency. 

The pre-ordering model has proved to be an effective approach for both Premium Lithium and our customers. Its success is evident from our customer feedback on Trustpilot which you can see here https://uk.trustpilot.com/review/premiumlithium.com. By pooling payments from multiple pre-orders, we are able to place larger orders with our manufacturing partners. This strategy leads to significant savings on purchasing, shipping, and installation planning. 

The payment for pre-orders is not insurance-backed. While insurance-backed payments offer certain security, they introduce additional complexities and costs. These costs would inevitably have to be passed onto our customers, which would offset the benefits of our pre-order savings. For additional security, we provide a complimentary credit card payment service. Utilising this service, you can avail full Section 75 payment protection up to £30,000 through your credit card company. It's an effective way to offer our customers peace of mind without the complexities and costs associated with insurance-backed solutions. 

--- 


You should choose Premium Lithium if you want to save up to 90% on your energy costs: by storing the energy from solar panels during the day and/or accessing cheaper rates of electricity from the grid at off-peak times, you can save up to 90% on your energy bills. 

You should choose Premium Lithium if you want to benefit from increased energy security: By taking advantage of our Emergency Power Source (EPS) functionality, your home battery can act like a back-up generator, giving you increased peace of mind during blackouts and power cuts. 

You should choose Premium Lithium if you want to store solar energy and reduce your carbon emissions: Our home batteries are compatible with all common solar PV arrays. By storing and using energy from the sun you'll reduce your reliance on polluting fossil fuels. 

You should choose Premium Lithium if you want to help to balance the strain on the national grid: Using a home battery can reduce your reliance on energy from the grid at peak times when demand for electricity is high. This can help to reduce the burden on the grid and on less clean energy sources. 

You should choose Premium Lithium if you want to Expand your capacity over time with modular design: As your energy needs change and evolve, your home battery system can too. Our clever modular system can be expanded upon over time to ensure that your capacity always matches your needs. 

--- 

Batteries we offer: Powerpod 5kwh, Powerpod 10kwh, Powerpanel 9.5kwh, Powerpod 15kwh, Powerplant 20kwh, Powerplant 30kwh, Powerplant 40kwh,  Powerplant 50kwh.
Powerpod 5kWh Smart Home Battery, Regular price £5,995 (ex. VAT), The 5kWh Powerpod is our small but powerful entry-level home battery. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs of smaller properties and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind. Product power: 5kWh, Nominal voltage: 51.2V, Nominal capacity: 100Ah 
Powerpod 10kWh Smart Home Battery, Regular price £9,995 (ex .VAT), The 10kWh Powerpod is a small but powerful home battery designed for small to medium homes. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind. Product power: 10kWh, Nominal voltage: 51.2V, Nominal capacity: 200Ah 
Powerpanel 9.5kWh Smart Home Battery, Regular price £9,995 (ex .VAT), The 9.5kWh Powerpanel is a small but powerful home battery designed for small to medium homes. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind. Product power: 9.5kWh, Nominal voltage: 51.2V, Nominal capacity: 185Ah 
Powerpod 15kWh Smart Home Battery, Regular price £13,990 (ex .VAT), The 15kWh Powerpod is a powerful wall-mounted LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs. Product power: 15kWh, Nominal voltage: 51.2V, Nominal capacity: 300Ah 
Powerplant 20kWh Smart Home Battery, Regular price £17,985 (ex .VAT), The 20kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs. Product power: 20kWh, Nominal voltage: 51.2V, Nominal capacity: 400Ah 
Powerplant 30kWh Smart Home Battery, Regular price £25,975 (ex .VAT), The 30kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs. Product power: 30kWh, Nominal voltage: 51.2V, Nominal capacity: 600Ah 
Powerplant 40kWh Smart Home Battery, Regular price £32,970 (ex .VAT), The 40kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs. Product power: 40kWh, Nominal voltage: 51.2V, Nominal capacity: 800Ah 
Powerplant 50kWh Smart Home Battery, Regular price £39,965 (ex .VAT), The 50kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs. Product power: 50kWh, Nominal voltage: 51.2V, Nominal capacity: 1000Ah 

`
uploadDocument(text);

async function uploadDocument(text) {
    let sections = text.split('---');
    const textSplitter = new RecursiveCharacterTextSplitter( {
        chunkSize: 500,
        chunkOverlap: 0,
    })

    const docs = await textSplitter.createDocuments(sections);

    const splitDocs = await textSplitter.splitDocuments(docs);

    await SupabaseVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings(),
        {
            client: supabase,
            tableName: "documents",
            queryName: "match_documents",
        },
    );
}

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
      handleParsingErrors: "Try again, make sure the formatting is correct."
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


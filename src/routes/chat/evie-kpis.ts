import { LANGCHAIN_API_KEY, LANGCHAIN_ENDPOINT, LANGCHAIN_PROJECT} from "$env/static/private";
import { Client } from "langsmith";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { kmeans } from 'ml-kmeans';
import { LLMChain } from "langchain/chains";
import { get_encoding, encoding_for_model } from "tiktoken"

let summaries = [];
const client = new Client({
    apiUrl: LANGCHAIN_ENDPOINT,
    apiKey: LANGCHAIN_API_KEY,
  })

export async function getRuns() {
    const runs = topLevelRuns();
    let count: number = 0;
    for await(const val of runs) {
        if(val.inputs.input && val.inputs.chat_history.length != 0){
            count++;
            console.log(val);
        }
    }
    return count;
}

export async function getErrorRate() {
    const runs = topLevelRuns();
    let count: number = 0;
    let errorCount: number = 0;
    for await(const val of runs) {
        if(val.inputs.input && val.inputs.chat_history.length != 0){
            count++;
            if(val.error) errorCount++;
        }
    }
    return `${(errorCount/count).toFixed(2)}%`;
}

export async function getAverageMessageCount(){
    const runs = topLevelRuns();
    let totalConversationLength = 0;
    let numOfConversations = 0;
    for await(const val of runs) {
        if(val.inputs.input && val.child_run_ids == null) {
            let humanMessages = val.inputs.chat_history.filter((x) => {return (x.id.includes('HumanMessage') && !x.kwargs.content.includes("Greet me with a friendly emoji"))});
            totalConversationLength += humanMessages.length;
            numOfConversations++;
        }
    }
    return numOfConversations == 0 ? 0 : (totalConversationLength / numOfConversations).toFixed(2);
}

export async function getFAQ(numFAQs: number) {
    const asyncRuns = topLevelRuns();
    let runs = [];
    for await(const val of asyncRuns) if(val.inputs.input) runs.push(val.inputs.input);
    let embedder = new OpenAIEmbeddings();
    let embeddings = await embedder.embedDocuments(runs);
    let numClusters = Math.min(numFAQs, Math.floor(runs.length / numFAQs));
    let kmeansResult = kmeans(embeddings, numClusters, {});
    let llm = new ChatOpenAI({modelName: "gpt-3.5-turbo-16k", temperature:0.7});
    const promptTemplate = ChatPromptTemplate.fromPromptMessages([
        [ "system", "You are a helpful AI assistant trained to generate insights on how users are using a product. You are given the following query logs:"],
        SystemMessagePromptTemplate.fromTemplate(`BEGIN LOGS
        -----
        {logs}
        -----
        END LOGS`),
        ["human", "Please respond with a single word title capturing the commonalities of these logs. These words should be like 'Solar', 'Energy Usage', 'Consultations' etc."]
      ]);
    const chain = new LLMChain({llm, prompt:promptTemplate});
    const enc = encoding_for_model("gpt-3.5-turbo-16k");

    let clusterGroups = [];
    [...Array(numFAQs).keys()].forEach((x) => clusterGroups.push([]));
    kmeansResult.clusters.forEach((x,i) => {
        clusterGroups[x].push(runs[i]);
    })

    for (let cluster of clusterGroups) {
        console.log(cluster);
        const clusterInputs = cluster.join("\n\n");
        let truncatedInputs = truncateInputs(clusterInputs, 15000, enc);
        let summary = await chain.run(truncatedInputs);
        summaries.push(summary);
    };
    console.log(summaries);
    return summaries.join(", ");
}

function truncateInputs(inputs: string, length: number, encoding) {
    return inputs.slice(encoding.decode(encoding.encode(inputs)).slice(15000));
}

const topLevelRuns = () => {
    return client.listRuns({
        projectName:LANGCHAIN_PROJECT,
        executionOrder:1,
    });
}



import { LANGCHAIN_API_KEY, LANGCHAIN_ENDPOINT, LANGCHAIN_PROJECT} from "$env/static/private";
import { Client } from "langsmith";

const client = new Client({
    apiUrl: LANGCHAIN_ENDPOINT,
    apiKey: LANGCHAIN_API_KEY,
  })

export async function getRuns() {
    const runs = topLevelRuns();
    let count: number = 0;
    for await(const val of runs) {
        if(val.inputs.chat_history.length != 0){
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
        if(val.inputs.chat_history.length != 0){
            count++;
            if(val.error) errorCount++;
        }
    }
    return `${(errorCount/count).toFixed(2)}%`;
}

export async function getAverageMessageCount(){
    // if child_run_ids.length == 0
    // chat length = inputs.chat_history.length
    const runs = topLevelRuns();
    let totalConversationLength = 0;
    let numOfConversations = 0;
    for await(const val of runs) {
        if(val.child_run_ids == null) {
            let humanMessages = val.inputs.chat_history.filter((x) => {return x.id.includes('HumanMessage')});
            console.log(humanMessages);
            totalConversationLength += humanMessages.length;
            numOfConversations++;
        }
    }
    return numOfConversations == 0 ? 0 : (totalConversationLength / numOfConversations).toFixed(2);
}

const topLevelRuns = () => {
    return client.listRuns({
        projectName:LANGCHAIN_PROJECT,
        executionOrder:1,
    });
}



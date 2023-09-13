
import { writable, get} from "svelte/store";

export enum ChatState {
    ASK_PRODUCT_OR_HELP,
    ASK_PRODUCTS,
    ASK_ENERGY_USAGE,
    ASK_SOLAR_PANELS,
    GET_HELP,
    NONE
};
export let currentState = writable(ChatState.ASK_PRODUCT_OR_HELP);

export function getPresetMessagesBasedOnState(currentState: ChatState) {
    switch(currentState) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            return ["Explore Products", "Help"];
        case ChatState.ASK_PRODUCTS:
            return ["Solar Panels", "Battery", "Solar and Battery", "Other"];
        case ChatState.ASK_ENERGY_USAGE:
            return ["Low (below 2000kWh)", "Medium (2000 - 5000kWh)","High (above 5000kWh)"];
        case ChatState.ASK_SOLAR_PANELS:
            return [];
        case ChatState.GET_HELP:
            return ["Book a consultation"];
        default:
            return [];
    }
}

export function getMessageBasedOnState(input: string){
    let inputLower = input.toLowerCase();
    switch(get(currentState)) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            if(inputLower.includes("product")) {
                currentState.set(ChatState.ASK_PRODUCTS);
                return `Send a message like 'Great! Let's find the perfect product for you. What are you looking for?' with a friendly emoji`;
                
            }
            else if(inputLower.includes("help")){
                currentState.set(ChatState.GET_HELP);
                return `Send a message like 'No problem, what can I help with today?' with a friendly emoji`;
            }
            break;
        case ChatState.ASK_PRODUCTS:
            if(inputLower.includes("solar") && inputLower.includes("battery")){
                
            }
            else if(inputLower.includes("solar")){

            }
            else if(inputLower.includes("battery")){

            }
            else {

            }
            break;
        case ChatState.GET_HELP:

            break;
        case ChatState.ASK_ENERGY_USAGE:
            
            break;
        case ChatState.ASK_SOLAR_PANELS:

            break;
        default: currentState.set(ChatState.NONE);
    }
    return null;
}
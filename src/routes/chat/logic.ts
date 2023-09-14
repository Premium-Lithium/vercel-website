import { writable, get} from "svelte/store";

export enum ChatState {
    ASK_PRODUCT_OR_HELP,
    ASK_PRODUCTS,
    ASK_BATTERY,
    ASK_SOLAR_PANELS,
    ASK_SOLAR_AND_BATTERY,
    ASK_ENERGY_USAGE,
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
            return ["No existing solutions", "I have solar", "I have a battery", "I have both solar and battery"];
        case ChatState.ASK_SOLAR_AND_BATTERY:
            return ["No existing solutions", "I have solar", "I have a battery", "I have both solar and battery"];
        case ChatState.ASK_BATTERY:
            return ["No existing solutions", "I have solar", "I have a battery", "I have both solar and battery"];
        case ChatState.GET_HELP:
            return ["Book a consultation"];
    }
    return [];
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
                currentState.set(ChatState.ASK_SOLAR_AND_BATTERY);
                return `Send a message like 'Great choice! We at Premium Lithium would highly recommend a Solar and Battery package. Do you already have any smart energy solutions?' with a friend emoji`;
            }
            else if(inputLower.includes("solar")){
                currentState.set(ChatState.ASK_SOLAR_PANELS);
                return `Send a message like 'Great choice! Do you already have any smart energy solutions?' with a friend emoji`;
            }
            else if(inputLower.includes("battery")){
                currentState.set(ChatState.ASK_BATTERY);
                return `Send a message like 'Great choice! Do you already have any smart energy solutions?' with a friend emoji`;
            }
            break;
        case ChatState.GET_HELP:
            currentState.set(ChatState.NONE);
            break;
        case ChatState.ASK_BATTERY:
            currentState.set(ChatState.NONE);
            break;
        case ChatState.ASK_SOLAR_PANELS:
            currentState.set(ChatState.NONE);
            break;
        case ChatState.ASK_SOLAR_AND_BATTERY:
            currentState.set(ChatState.NONE);
            break;
        case ChatState.NONE:
            currentState.set(ChatState.NONE);
            break;
        default: currentState.set(ChatState.NONE)
            break;
    }
    return null;
}
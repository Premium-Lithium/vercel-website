import { writable, get} from "svelte/store";

export enum ChatState {
    ASK_PRODUCT_OR_HELP,
    ASK_PRODUCTS,
    ASK_BATTERY,
    ASK_SOLAR_PANELS,
    ASK_SOLAR_AND_BATTERY,
    ASK_ENERGY_USAGE,
    ASK_EXISTING,
    GET_HELP,
    NO_SOLUTIONS,
    HAS_SOLAR,
    HAS_BATTERY,
    HAS_SOLAR_AND_BATTERY,
    NONE
};
export let currentState = writable(ChatState.ASK_PRODUCT_OR_HELP);
export let stateFlow = writable([currentState]);

export function changeStateWithMessage(state: ChatState = ChatState.NONE, message: string = "") {
    stateFlow.set([...get(stateFlow), currentState]);
    currentState.set(state);
    return `Send a message like '${message}' with a friendly emoji`;
}

export function getPresetMessagesBasedOnState(currentState: ChatState) {
    switch(currentState) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            return ["Explore Products", "Help"];
        case ChatState.ASK_PRODUCTS:
            return ["Solar Panels", "Battery", "Solar and Battery", "Other"];
        case ChatState.ASK_ENERGY_USAGE:
            return ["Low (below 2000kWh)", "Medium (2000 - 5000kWh)","High (above 5000kWh)"];
        case ChatState.ASK_EXISTING:
            return ["No existing solutions", "I have solar", "I have a battery", "I have both solar and battery"];
        case ChatState.GET_HELP:
            return ["Book a consultation"];
    }
    return ["I didn't understand", "Start over"];
}

export function getMessageBasedOnState(input: string){
    let inputLower = input.toLowerCase();
    switch(get(currentState)) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            if(inputLower.includes("product")) {
                return changeStateWithMessage(ChatState.ASK_PRODUCTS, "Great! Let's find the perfect product for you. What are you looking for?");
            }
            else if(inputLower.includes("help")){
                return changeStateWithMessage(ChatState.GET_HELP, "No problem, what can I help with today?");
            } else currentState.set(ChatState.NONE);
            break;
        case ChatState.ASK_PRODUCTS:
            if(inputLower.includes("solar") && inputLower.includes("battery")){
                return changeStateWithMessage(ChatState.ASK_EXISTING, "Great choice! We at Premium Lithium would highly recommend a Solar and Battery package. Do you already have any smart energy solutions?");
            }
            else if(inputLower.includes("solar")){
                return changeStateWithMessage(ChatState.ASK_EXISTING, "Great choice! Do you already have any smart energy solutions?");
            }
            else if(inputLower.includes("battery")){
                return changeStateWithMessage(ChatState.ASK_EXISTING, "Great choice! Do you already have any smart energy solutions?");
            } else changeStateWithMessage();
        case ChatState.ASK_EXISTING:
            if(inputLower.includes("solar") && inputLower.includes("battery")) {

            }
            else if(inputLower.includes("solar")) {

            }
            else if(inputLower.includes("battery")) {

            }
            else if(inputLower.includes("no existing")) {

            } else changeStateWithMessage();
        case ChatState.ASK_ENERGY_USAGE:
            changeStateWithMessage();
        case ChatState.GET_HELP:
            changeStateWithMessage();
        case ChatState.NO_SOLUTIONS:
            changeStateWithMessage();
        case ChatState.HAS_SOLAR:
            changeStateWithMessage();
        case ChatState.HAS_BATTERY:
            changeStateWithMessage();
        case ChatState.HAS_SOLAR_AND_BATTERY:
            changeStateWithMessage();
        case ChatState.ASK_BATTERY:
            changeStateWithMessage();
        case ChatState.ASK_SOLAR_PANELS:
            changeStateWithMessage();
        case ChatState.ASK_SOLAR_AND_BATTERY:
            changeStateWithMessage();
        case ChatState.NONE:
            changeStateWithMessage();
        default: changeStateWithMessage()
            break;
    }
    return null;
}
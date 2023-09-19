import { writable, get } from "svelte/store";

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
    ESTIMATE_ENERGY_USAGE_PROPERTY,
    ESTIMATE_ENERGY_USAGE_OCCUPANTS,
    NONE
};
export let currentState = writable(ChatState.ASK_PRODUCT_OR_HELP);
export let stateFlow = writable([currentState]);

export function changeStateWithMessage(state: ChatState = ChatState.NONE, message: string = "") {
    stateFlow.set([...get(stateFlow), currentState]);
    currentState.set(state);
    return `Send a friendly message like '${message}' with a friendly emoji`;
}

export function getPresetMessagesBasedOnState(currentState: ChatState) {
    switch(currentState) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            return ["Explore Products", "Help"];
        case ChatState.ASK_PRODUCTS:
            return ["Solar Panels", "Battery", "Solar and Battery", "Other"];
        case ChatState.ASK_ENERGY_USAGE:
            return ["Low (below 2000kWh)", "Medium (2000 - 5000kWh)","High (above 5000kWh)","I don't know"];
        case ChatState.ASK_EXISTING:
            return ["No existing solutions", "I have solar", "I have a battery", "I have both solar and battery"];
        case ChatState.GET_HELP:
            return ["Book a consultation"];
        case ChatState.ESTIMATE_ENERGY_USAGE_PROPERTY:
            return ["Semi-Detached", "Detached", "Bungalow", "Flat", "Terraced"];
    }
    return [];
}

export function getMessageBasedOnState(input: string){
    let inputLower = input.toLowerCase();
    if(inputLower.includes("human") || inputLower.includes("someone") || inputLower.includes("consultation")) {
        return changeStateWithMessage(ChatState.ASK_PRODUCT_OR_HELP, "If you'd prefer to book a free consultation, feel free to click the button at the top! I'm happy to help with any queries in the meantime!")
    }
    switch(get(currentState)) {
        case ChatState.ASK_PRODUCT_OR_HELP:
            if(inputLower.includes("product")) {
                return changeStateWithMessage(ChatState.ASK_PRODUCTS, "Great! Let's find the perfect product for you. What are you looking for?");
            }
            else if(inputLower.includes("help")){
                return changeStateWithMessage(ChatState.GET_HELP, "No problem, what can I help with today?");
            } else changeStateWithMessage();
            break;
        case ChatState.ASK_PRODUCTS:
            if(inputLower.includes("solar") && inputLower.includes("battery")){
                return changeStateWithMessage(ChatState.ASK_ENERGY_USAGE, "Great choice! We at Premium Lithium would highly recommend a Solar and Battery package. How much energy do you use per year? (kWh)");
            }
            else if(inputLower.includes("solar")){
                return changeStateWithMessage(ChatState.ASK_ENERGY_USAGE, "Great choice! How much energy do you use per year? (kWh)");
            }
            else if(inputLower.includes("battery")){
                return changeStateWithMessage(ChatState.ASK_ENERGY_USAGE, "Great choice! How much energy do you use per year? (kWh)");
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
            if(inputLower.includes("don") && inputLower.includes("know")) {
                return changeStateWithMessage(ChatState.ESTIMATE_ENERGY_USAGE_PROPERTY, "No problem! To help estimate your energy usage, what kind of property do you live in?")
            }
            changeStateWithMessage();
        case ChatState.ESTIMATE_ENERGY_USAGE_PROPERTY:

        case ChatState.ESTIMATE_ENERGY_USAGE_OCCUPANTS:
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
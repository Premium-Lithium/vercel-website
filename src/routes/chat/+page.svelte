<script lang='ts'>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
    let awaitingMessage = false;
    let previousMessages: {"role": string, "content": string}[] = [];
    let  messageToSend = `Greet me with a friendly emoji`;

    enum ChatState {
        ASK_PRODUCT_OR_HELP,
        ASK_ENERGY_USAGE,
        ASK_SOLAR_PANELS,
        GET_HELP
    };

    let currentState = ChatState.ASK_PRODUCT_OR_HELP;

    onMount(async () => {
        invalidateAll();
        const response = await fetch('chat/', {
            method: 'POST',
            body: JSON.stringify({ "prompt" : [{"role": "user", "content": messageToSend}] }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        awaitingMessage = false;
        const { message } = await response.json();
        previousMessages = [{"role": "assistant", "content": message.output}];
    });

    function getMessageBasedOnState(input: string){
        switch(currentState) {
            case ChatState.ASK_PRODUCT_OR_HELP:
                if(input.toLowerCase().includes("product")) {
                    return `Send a message like 'Great! Let's find the perfect product for you. How much energy do you use in a year?' with a friendly emoji`;
                    currentState = ChatState.ASK_ENERGY_USAGE;
                }
                else if(input.toLowerCase().includes("help")){
                     {
                    return `Send a message like 'No problem, what can I help with today?' with a friendly emoji`;
                    currentState = ChatState.GET_HELP;
                }
                }
                break;
            case ChatState.ASK_ENERGY_USAGE:
        
                break;
            case ChatState.ASK_SOLAR_PANELS:

                break;
        }
        return null;
    }


</script>

<div class="wrapper">
    <div class="messages">
    {#each previousMessages as message}
        {#if message.role==="user"}
            <h2 in:fly|global={{x:1000, duration:1000}} class="message-{message.role}">{message.content}</h2>
        {:else}
            <h2 class="message-{message.role}">{message.content}</h2>
        {/if}
    {/each}
    {#if awaitingMessage}
        <h2 in:fly|global={{x:-1000, duration:1000}} class="message-assistant">...</h2>
    {/if}
    </div>
    <form>
        <input 
        class="chat-input"
        type="text"
        autocomplete="off"
        on:keydown = {async (e) => {
            if(e.key === 'Enter'){
                awaitingMessage = true;
                const input = e.currentTarget;
                let prompt = input.value;
                if(currentState == ChatState.ASK_PRODUCT_OR_HELP) {
                    let msg = getMessageBasedOnState(prompt);
                    if(!msg) {
                        prompt = msg;
                    }
                }
                previousMessages = [...previousMessages, {"role": "user", "content": prompt}];
                const messages = previousMessages;
                const chatRequestUrl = 'chat/';
                input.value = '';
                const response = await fetch(chatRequestUrl, {
                    method: 'POST',
                    body: JSON.stringify({ "prompt" : messages }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                awaitingMessage = false;
                let output;
                if (!response.ok) {
                    output = "I'm unable to respond to that.";
                }
                else {
                    const { message } = await response.json();
                    if (message == 'Agent stopped due to max iterations.') {
                        output = "Request timed out.";
                    }
                    else output = message.output;
                }
                previousMessages = [...previousMessages, {"role": "assistant", "content": output}];
            }
        }}
        />
    </form>
    
</div>

<style>
    .messages {
        display: flex;
        flex-direction: column;
        width: 90vw;
        position: absolute;
        left: 3vw;
        border: 2px solid black; 
        padding: 1vh 2vw 1vh 2vw;  
        height: 80vh;
        top: 3vh;
        border-radius: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
    }

    [class^="message-"]{ 
        width:fit-content;
        font-family: 'Roboto', sans-serif;
        font-size: 1.3em;
        padding: 15px; 
        border: 3px solid #177ba7;
        background-color:#53b4de;    
        color: #FFF;
        max-width: 75%;
    }

    .message-system, .message-assistant {
        align-self: start;
        border-radius: 30px 30px 30px 1px;
        background-color: #11a3e2;
        box-shadow: -3px 4px 8px rgba(0, 0, 0, 0.5);
    }
    
    
    .message-user {
        align-self: end;
        border-radius: 30px 30px 5px 30px;
        box-shadow: 3px 4px 8px rgba(0, 0, 0, 0.5);
    }

    .chat-input {
        position: absolute;
        bottom: 10vh;
        width: 80vw;
        height: auto;
        font-size: 2em;
        left: 10vw;
        border-radius: 5px;
    }

</style>
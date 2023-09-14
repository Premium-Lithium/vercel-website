<script lang='ts'>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css';
    import {ChatState, getMessageBasedOnState, getPresetMessagesBasedOnState, currentState} from './logic';

    let awaitingMessage = true;
    let previousMessages: {"role": string, "content": string}[] = [];
    let messageToSend = `Greet me with a friendly emoji and introduce yourself, and ask whether I'd like to explore products or just need some help`;
    let chatInput = "";
    let presetResponses: Array<string> = [];
    $: presetResponses = getPresetMessagesBasedOnState($currentState);
    let comment = "";
    let rating = 0;
    let currentRunId = '';
    
    onMount(async () => {
        invalidateAll();
        $currentState = ChatState.ASK_PRODUCT_OR_HELP;
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

    async function handleFeedbackComment(score: number) {
        let response = await fetch('chat/feedback', {
            method: "POST",
            body: JSON.stringify({
                run_id: currentRunId,
                score,
                comment: "",
            })
        })

        response = await response.json();
        if(!response.error) {
            toastr.success("Feedback sent successfully", "", {
                timeOut: 1000,
                progressBar: true,
            })
        } else {
            toastr.error(`Error sending feedback: ${response.error}`, "", {
                timeOut: 1000,
                progressBar: true,
            })
        }
    }

    async function handleChatInput(e) {
        awaitingMessage = true;
        let prompt = chatInput;
        previousMessages = [...previousMessages, {"role": "user", "content": prompt}];
        let messages = previousMessages;
        let msg = getMessageBasedOnState(prompt);
        if(msg != null) {
            messages = [...previousMessages.slice(0,-1), {"role": "system", "content": msg}];
        }
        const chatRequestUrl = 'chat/';
        chatInput = '';
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
            const { message, runId } = await response.json();
            currentRunId = runId.runId;
            if (message == 'Agent stopped due to max iterations.') {
                output = "Request timed out.";
            }
            else {
                output = message.output;
            }
        }
        previousMessages = [...previousMessages, {"role": "assistant", "content": output}];
    }


</script>

<body>
    <div class="messages">
    {#each previousMessages as message, i}
        {#if message.role==="user"}
            <h2 in:fly|global={{x:1000, duration:1000}} class="message-{message.role}">{message.content}</h2>
        {:else}
            <div class="message-{message.role}">
                <h2>{message.content}</h2>
                <!-- Don't show rating on first message. -->
                {#if i != 0}
                <div class="feedback-icons disable-text-select">
                    <h2 on:click={() => {handleFeedbackComment(0)}}>👎</h2>
                    <h2 on:click={() => {handleFeedbackComment(1)}}>👍</h2>
                </div>
                {/if}
            </div>
            
        {/if}
    {/each}

    {#if awaitingMessage}
        <h2 in:fly|global={{x:-1000, duration:1000}} class="message-assistant">...</h2>
    {:else}
    {#each presetResponses as response}
        <h2 class="message-user preset-response disable-text-select"
        on:click={(e) => {chatInput = response; handleChatInput(e)}}
        in:fly|global={{x:1000, duration:1000}}>
        {response}
        </h2>
    {/each}
    {/if}
    </div>
    <form on:submit|preventDefault={handleChatInput}>
        <input 
        class="chat-input"
        type="text"
        autocomplete="off"
        bind:value={chatInput}
        />
    </form>
</body>

<style>
    body {
        background-color: black;
    }
    .messages {
        display: flex;
        flex-direction: column;
        width: 90vw;
        position: absolute;
        left: 3vw;
        border: 2px solid white; 
        background-color: white;
        box-shadow: 0px 0px 20px rgba(255, 255, 255, 1);
        padding: 1vh 2vw 1vh 2vw;  
        height: 75vh;
        top: 3vh;
        border-radius: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
    }

    [class^="message-"]{ 
        width:fit-content;
        font-family: 'Roboto', sans-serif;
        font-size: 0.7em;
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

    .message-assistant > h2 {
        font-size: 1.3em;
    }
    
    .preset-response:hover {
        background-color: #50aad1;
    }

    .preset-response {
        padding-top: 10px;
        padding-bottom: 10px;
        margin-top: 3px;
        margin-bottom: 3px;
    }
    
    .message-user {
        align-self: end;
        border-radius: 30px 30px 5px 30px;
        box-shadow: 3px 4px 8px rgba(0, 0, 0, 0.5);
    }

    .feedback-icons {
        display: flex;
        flex-direction: row-reverse;
    }

    .feedback-icons > h2 {
        font-size: 1.2em;
        margin: 0px 10px;
        background-color:#53b4de;
        border-radius: 50%;
        padding: 6px;
    }

    .chat-input {
        box-shadow: 0px 0px 20px rgba(255, 255, 255, 1);
        border-color: white;
        position: absolute;
        bottom: 10vh;
        width: 80vw;
        height: auto;
        font-size: 2em;
        left: 10vw;
        border-radius: 5px;
    }

</style>
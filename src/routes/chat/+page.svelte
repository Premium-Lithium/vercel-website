<script lang='ts'>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css';
    import { ChatState, getMessageBasedOnState, getPresetMessagesBasedOnState, currentState } from './logic';
	import { page } from '$app/stores';

    let testingMode = false;
    if($page.url.searchParams.get('testingMode') === 'true'){
        testingMode = true;
    }

    type Message = {"role": string, "content": string, "runId": string, "feedbackId"?: string, "feedback"?: string, "score"?: number};

    let awaitingMessage = true;
    let previousMessages: Message[] = [];
    let messageToSend = `Greet me with a friendly emoji and introduce yourself, and ask whether I'd like to explore products or just need some help`;
    let chatInput = "";
    let presetResponses: Array<string> = [];
    $: presetResponses = getPresetMessagesBasedOnState($currentState);
    let currentRunId = '';
    let delays: Array<number> = [];


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
        addMessage({"role": "assistant", "content": message.output, "runId": ""}, 0);
    });

    function scrollToBottom() {
        var scrollContainer = document.getElementsByClassName('messages')[0];
        console.log(scrollContainer);
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    function addMessage(message: Message, delay: number) {
        let delayOffset = 1500;
        previousMessages = [...previousMessages, message];
        delays = [...delays, delayOffset * delay];
        scrollToBottom();
    }

    async function handleFeedbackComment(message: Message) {
        if(!message.feedbackId){
            let response = await fetch('chat/feedback', {
                method: "POST",
                body: JSON.stringify({
                    run_id: message.runId,
                    score: message.score,
                    comment: "",
                })
            })

            response = await response.json();
            let feedbackId: string = response.feedback.id;
            if(!response.error) {
                toastr.success("Feedback sent successfully", "", {
                    timeOut: 1000,
                    progressBar: true,
                })
                message.feedbackId = feedbackId;
            } else {
                toastr.error(`Error sending feedback: ${response.error}`, "", {
                    timeOut: 1000,
                    progressBar: true,
                })
            }
        }

        if(message.feedback) {
            let response = await fetch('chat/feedback', {
                method: "PUT",
                body: JSON.stringify({
                    run_id: message.runId,
                    id: message.feedbackId,
                    score: message.score,
                    comment: message.feedback,
                })
            })

            response = await response.json();
            let feedbackId: string = response.feedback.id;
            if(!response.error) {
                toastr.success("Feedback sent successfully", "", {
                    timeOut: 2000,
                    progressBar: true,
                })
                message.feedbackId = feedbackId;
            } else {
                toastr.error(`Error sending feedback: ${response.error}`, "", {
                    timeOut: 2000,
                    progressBar: true,
                })
            }
        }

        return message;
    }

    async function handleChatInput(e) {
        awaitingMessage = true;
        let prompt = chatInput;
        addMessage({"role": "user", "content": prompt, "runId": ""},0);
        let messages = previousMessages;
        let msg = getMessageBasedOnState(prompt);
        if(msg != null) {
            messages = [...previousMessages.slice(0,-1), {"role": "system", "content": msg, "runId": ""}];
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
        let outputs: string[];
        if (!response.ok) {
            outputs = ["I'm unable to respond to that."];
        }
        else {
            const { message, runId } = await response.json();
            currentRunId = runId.runId;
            if (message == 'Agent stopped due to max iterations.') {
                outputs = ["Request timed out."];
            }
            else {
                outputs = message.output.split('. ');
                console.log(outputs);
            }
        }
        outputs.forEach((o,i) => {
            if(o.length > 1) {
                addMessage({"role": "assistant", "content": o, "runId": currentRunId},i);
            }
        })
    }


</script>

<body>
    <div class="messages">
    {#each previousMessages as message, i}
        {#if message.role==="user"}
            <h2 in:fly|global={{x:1000, duration:1000}} class="message-{message.role}">{message.content}</h2>
        {:else}
            <div in:fly|global={{x:-1000, duration:1000, delay:delays[i]}} class="message-{message.role}">
                <h2>{message.content}</h2>
                <!-- Don't show rating on first message. -->
                {#if i != 0}
                <div class="feedback-icons disable-text-select">
                    <h2 on:click={
                        async () => {
                        message.score = -1;
                        message = await handleFeedbackComment(message)
                    }}>👎</h2>
                    <h2 on:click={
                        async () => {
                        message.score = 1;
                        message = await handleFeedbackComment(message)
                    }}>👍</h2>
                    {#key message.feedbackId}
                        {#if testingMode && message.feedbackId}
                        <form on:submit={async () => {await handleFeedbackComment(message)}}>
                            <input type="text" class="feedback-input" bind:value={message.feedback}  placeholder="Enter feedback"/>
                            <input type="submit"/>
                        </form>
                        {/if}
                    {/key}
                </div>
                {/if}
            </div>

        {/if}
    {/each}
    {#if awaitingMessage}
        <div in:fly|global={{x:-1000, duration:1000}} class="message-assistant awaiting-message">
            <h1>.</h1><h1>.</h1><h1>.</h1>
        </div>
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
        padding: 5px 10px;
        margin-top: 10px;
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
        margin: 0px 5px;
        background-color:#53b4de;
        border-radius: 50%;
        width: 15px;
        height: 15px;
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

    .awaiting-message{
        display: flex;
        flex-direction: row;
        padding-top: 0px;
        padding-bottom: 0px;
    }

    .awaiting-message > h1 {
        display: inline-block;
        animation: bounce-awaiting-message 1.5s infinite;

    }

    .awaiting-message h1:nth-child(2) {
        animation-delay: 0.25s;
    }

    .awaiting-message h1:nth-child(3) {
        animation-delay: 0.5s;
    }

    @keyframes bounce-awaiting-message {
        0%, 70% {
            transform: translateY(0);
        }
        35% {
            transform: translateY(-4px);
        }
    }

</style>
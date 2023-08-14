<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    let awaitingMessage = false;
    let previousMessages = [];
    const initialMessage = `You are Evie, a friendly customer assistant for Premium Lithium,
    a UK green energy company. 
    You must attempt to answer the customer's query and provide 3 follow-up questions in a list following your answer.

    Start the conversation by greeting the customer with a friendly emoji.
`;

    onMount(async () => {
        const response = await fetch('chat/', {
            method: 'POST',
            body: JSON.stringify({ "prompt" : [{"role": "assistant", "content": initialMessage}] }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        awaitingMessage = false;
        const { message } = await response.json();
        console.log(message);
        previousMessages = [{"role": "assistant", "content": message.text}];
    });
</script>

<div class="wrapper">
    <div class="messages">
    {#each previousMessages as message}
        {#if message.role==="user"}
            <h2 in:fly={{x:1000, duration:1000}} class="message-{message.role}">{message.content}</h2>
        {:else}
            <h2 class="message-{message.role}">{message.content}</h2>
        {/if}
    {/each}
    {#if awaitingMessage}
        <h2 in:fly={{x:-1000, duration:1000}} class="message-assistant">...</h2>
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
                const prompt = input.value;
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
                const { message } = await response.json();
                console.log(message);
                previousMessages = [...previousMessages, {"role": "assistant", "content": message.text.split('|')}];
                console.log(message.content);
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
        background-color:#28AAE2;    
        color: #FFF;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
    }

    .message-system, .message-assistant {
        align-self: start;
        border-radius: 30px 30px 30px 1px;
    }
    
    
    .message-user {
        align-self: end;
        border-radius: 30px 30px 5px 30px;
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
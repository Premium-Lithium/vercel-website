<script>
    import { page } from '$app/stores';
	import { each } from 'svelte/internal';
    export let data;
    let previousMessages = [{"role": "system", "content": 
    "You are a friendly, helpful chatbot named Evie"}];
</script>

<div class="wrapper">
    <div class="messages">
    {#each previousMessages.slice(1) as message}
        <h2 class="message-{message.role}">{message.content}</h2>
    {/each}
    </div>
    <form>
        <input 
        class="chat-input"
        type="text"
        autocomplete="off"
        on:keydown = {async (e) => {
            if(e.key === 'Enter') {
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
                const { message } = await response.json();
                previousMessages = [...previousMessages, {"role": "assistant", "content": message.content}];
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
        left: 5vw;

    }

    [class^="message-"]{ 
        width:fit-content;
        font-family: 'Roboto', sans-serif;
        font-size: 1.3em;
        padding: 15px; 
        border: 3px solid #177ba7;
        background-color:#28AAE2;    
        color: #FFF;
    }

    .message-system, .message-assistant {
        align-self: start;
        border-radius: 30px 30px 30px 1px;
    }
    
    
    .message-user {
        align-self: end;
        border-radius: 30px 30px 5px 30px;
    }
    .wrapper {
        justify-items: center;
        align-items: center;
    }

    .chat-input {
        position: absolute;
        bottom: 10vh;
        width: 80vw;
        height: auto;
        font-size: 2em;
        left: 10vw;
    }

</style>
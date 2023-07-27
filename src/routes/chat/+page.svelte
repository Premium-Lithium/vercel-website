<script>
    import { fly } from 'svelte/transition';
    let awaitingMessage = false;
    let previousMessages = [{"role": "system", "content": 
    "You are a friendly, helpful chatbot named Evie"}];

    function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.15);

		return {
			duration,
			tick: (t) => {
				const i = Math.trunc(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

<div class="wrapper">
    <div class="messages">
    {#each previousMessages.slice(1) as message}
        {#if message.role==="user"}
            <h2 in:fly={{x:1000, duration:1000}} class="message-{message.role}">{message.content}</h2>
        {:else}
            <h2 in:typewriter class="message-{message.role}">{message.content}</h2>
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
            if(e.key === 'Enter') {
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
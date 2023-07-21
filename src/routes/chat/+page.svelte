<script>
let text;
let output;

import { openai } from '$lib/chat/chat.js'
    const completion = async () => { output = 
        await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: "What is the square root of 64?"}],
            max_tokens: 1000,
            temperature: 0.7
        });
    output = output.data.choices[0].text;
    }
</script>

<input bind:value={text}/> <button on:click={completion}>Send</button>

{#if text}
    {text}
{/if}
<br/>
{#if output}
    {output}
{/if}
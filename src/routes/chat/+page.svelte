<script>
    import { page } from '$app/stores';
	import { stringify } from 'querystring';
 export let data;
</script>

<div>
    <h1>chat</h1>
    <form>
        <label>send a chat
            <input 
            type="text"
            autocomplete="off"
            on:keydown = {async (e) => {
                if(e.key === 'Enter');
                const input = e.currentTarget;
                const description = input.value;
                const chatRequestUrl = '${page.url.origin}/api/chat/chat';
                const response = await fetch(chatRequestUrl, {
                    method: 'POST',
                    body: JSON.stringify({ description }),
                });
                const { id } = await response.json();
                input.value = '';
            }};
            />
        </label>
    </form>
</div>
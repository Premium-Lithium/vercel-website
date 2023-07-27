<script>
    import { page } from '$app/stores'
	import { onMount } from 'svelte';
    
    onMount(async () => {
        const email = $page.url.searchParams.get('email');
            const unsubscribeUrl = `unsubscribe/`;
            const res = await fetch(unsubscribeUrl, {
                method: 'POST',
                headers: {
                   "Content-Type": "application/json"
                }, 
                body: JSON.stringify({
                    "values": [email, "noreason"],
                }),
            });
            const response = await res.json();
            return response;
        
        })
    

</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    <div class="unsub-text">
        <h1>It appears you want to be removed from our list of approved installers who are interested in growing their bussiness</h1>
        <h1>Can you please tell us why this may be?</h1>
    </div>
    
</div>

<style>
    .body {
        margin: auto;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .body > h1 {
        font-size: 4em;
        text-align: center;
    }
  
    .logo{
        position: absolute;
        align-self: center;
        top: 0;
    }

</style>

   
<script>
    import { page } from '$app/stores'
	import { onMount } from 'svelte';
    const email = $page.url.searchParams.get('email');
    
    onMount(async () => {
            const unsubscribeUrl = `${$page.url.origin}/api/blacklistEmail`;
            const res = await fetch(unsubscribeUrl, {
                method: 'PUT',
                body: JSON.stringify({
                "email": email,
                }),
                headers: {
                   "Content-Type": "application/json"
            }, 
            });
            const response = await res.json();
            {console.log("installer " + email + " has unsubscribed")}
            return response;
        
        })
    

</script>

<div class=body>        
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    <div class="unsub-text">
        <h1>You have unsubscribed</h1>
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

   
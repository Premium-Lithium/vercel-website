<script>
    import { onMount } from 'svelte';
    import { page } from "$app/stores";

    import { isAuthenticated, user, accessToken } from "$lib/installer-portal/sessionStore";
    import auth from "$lib/installer-portal/authService"

    import LeadView from "$lib/components/LeadView.svelte";


    let auth0Client;
    let installerId;

    onMount(async () => {
        auth0Client = await auth.createClient();

        isAuthenticated.set(await auth0Client.isAuthenticated());
        user.set(await auth0Client.getUser());
    });


    let installerData
    let dataStatus = "waiting";


    async function login() {
        dataStatus = "loading";
        const userdata = await auth.loginWithPopup(auth0Client);

        const newAccessToken = await auth0Client.getTokenSilently()
        accessToken.set(newAccessToken)

        console.log("Fetching installer data...");
        installerData = await fetchData();
        dataStatus = "done";
        console.log(installerData)
    }

    function logout() {
        auth.logout(auth0Client);
    }

    async function fetchData() {
        const dataUrl = `${$page.url.origin}/installer-portal`;

        const res = await fetch(dataUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${$accessToken}`
            },
        })
        return await res.json();
    }

</script>

<style>
  /* Global Styles */
  .logo {
    max-width: 400px;
    display: flex;
    margin: 0 auto;
    align-self: center;
  }
</style>

<img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">

{#if !$isAuthenticated || dataStatus === "waiting"}
    <a href="" on:click={login}>Sign In</a>
{:else if (dataStatus === "loading")}
    Loading
{:else}
    <LeadView data={installerData}/>
{/if}

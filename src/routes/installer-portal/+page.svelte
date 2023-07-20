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


    //export let data
    let data = { data: undefined };
    let installerData
    console.log(data);


    async function login() {
        console.log("About to log in")
        const userdata = await auth.loginWithPopup(auth0Client);
        const newAccessToken = await auth0Client.getTokenSilently()
        accessToken.set(newAccessToken)


        const userdataUrl = `${$page.url.origin}/userdata`;
        installerId = userdata[userdataUrl]["installerId"];

        installerData = await fetchData(installerId);
        console.log(installerData)



    }

    function logout() {
        auth.logout(auth0Client);
    }

    async function fetchData(id) {
        const dataUrl = `${$page.url.origin}/api/installer/leads/data`;

        const res = await fetch(dataUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${$accessToken}`
            },
            body: JSON.stringify({
                "installerId": id,
            }),
        })

        return res
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

<div>
    {$isAuthenticated} with installer id {installerId}
</div>
{#if !$isAuthenticated}
    Not authenticated
    <a href="" on:click={login}>get some fresh auth here</a>
{:else}
    Authenticated
    <!--<LeadView {data}/>-->
{/if}

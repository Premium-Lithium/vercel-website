<script>
	import { onMount } from "svelte";
    import Loading from "$lib/components/Loading.svelte";
    let loading = false;
    let success = false;
    onMount(async () => {
        loading = true;
        const res = await fetch('upload-docs/', {
            method: "GET",
        })
        loading = false;
        if(res.ok) success = true;
    })

</script>

<body>
{#if loading}
<Loading></Loading>
{/if}
{#if success}
    <h2>documents uploaded</h2>
{/if}
</body>

<style>
    body {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
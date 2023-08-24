<script>
    export let currentPage = 0;
    export let lastPage = 0;

    import PageNext from "svelte-material-icons/PageNext.svelte"
    import PagePrevious from "svelte-material-icons/PagePrevious.svelte"

    function goBack(){
        currentPage -=1;
    }

    function goNext(){
        currentPage+=1;
        return currentPage;
    }

</script>

<div class=body>
    {#if currentPage > 0}
        <button type="submit" on:click={goBack}><PagePrevious/></button>
    {/if}
    {#if currentPage < lastPage}
        <button type="submit" on:click={goNext}><PageNext/></button>
    {/if}
</div>

<style>
    .body {
        margin: 0;
        display: flex;
        align-items: right;
        flex-direction: row;
    }

    button{
        background-color: var(--plblue);
        color: white;
        border: none; 
        font-size: 20px;
        height:auto; 
        width:100px; 
        padding:10px 5px; 
        margin:30px; 
        border-radius:5px;
        
    }
</style>

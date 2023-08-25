<script>
    export let currentPage = 0;
    export let lastPage = 0;

    import ChevronRight from "svelte-material-icons/ChevronRight.svelte"
    import ChevronLeft from "svelte-material-icons/ChevronLeft.svelte"

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
        <button type="submit" on:click={goBack}>
            <ChevronLeft/> Back
        </button>
    {:else}
        <div/>
    {/if}
    {#if currentPage < lastPage}
        <button type="submit" on:click={goNext}>
            Next <ChevronRight/>
        </button>
    {:else}
        <div/>
    {/if}
</div>

<style>
    .body {
        margin: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
        display: flex;
        align-items: center;
        justify-content: center;
        
    }
</style>

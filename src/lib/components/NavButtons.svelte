<script>
    export let currentPage = 0;
    export let lastPage = 0;

    function goBack(){
        currentPage -=1;
    }

    function goNext(){
        currentPage+=1;
        return currentPage;
    }

</script>

<div class=body>
    {#if currentPage > 1}
        <button type="submit" on:click={goBack}> previous</button>
    {/if}
    {#if currentPage < lastPage}
        <button type="submit" on:click={goNext}>next</button>
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
        background-color: #28AAE2;
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto; 
        width:100px; 
        padding:10px 5px; 
        margin:30px; 
        border-radius:5px;
        
    }
</style>
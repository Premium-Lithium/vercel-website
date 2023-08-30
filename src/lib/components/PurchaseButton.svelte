
<script>
    function makePurchase() {
        /*
            Todo after obtaining product info from store
             - add to cart
             - 
        */
    }
</script>

<div class=body>
    <button type="button" on:click={makePurchase}>
        Purchase 
    </button>
</div>


<style>
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
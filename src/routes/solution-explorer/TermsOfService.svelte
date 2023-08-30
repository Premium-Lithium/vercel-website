<script lang="ts">
    
    export let tosAccepted = false;
    import Modal from "$lib/components/Modal.svelte";

    let tosVisible;
    $:tosVisible = false;
    let dialog;
    function tosClicked() {
        tosVisible = !tosVisible;
    }

    function tosChoice(choice) {
        tosAccepted = choice;
        tosVisible = false;
        dialog.close();
    }

    function order() {
        if(!tosAccepted) {
            tosVisible = true;
            return;
        } else {
            alert ("TODO: process order");
        }
    }
    
</script>
<div>

<button class="tos-button" on:click={tosClicked}>See terms of service</button>
<Modal bind:showModal={tosVisible} bind:dialog>
    <h2>Terms of service</h2>
    <p>
        To proceed, you must agree to our terms of service
        <a target="_blank" href="solution-explorer/docs/terms-of-service.html">Click here for our terms of service</a>
    </p>
    <div class="button-div">
        <button class="agree-button" on:click={() => tosChoice(true)}>I agree</button>
        <button class="disagree-button" on:click={() => tosChoice(false)}>I disagree</button>
    </div>
</Modal>

<button on:click={order} class={tosAccepted ? 'a' : 'b'}>{ tosAccepted ? "Order now": "Please accept terms of service"}</button>

</div>
<style>
    button{
        background-color: var(--plblue);
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto;
        width: auto;
        padding: 1rem; 
        border-radius:5px;
        transition-duration: 1s;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);

    }
    button:hover {
        box-shadow: 0 5px 15px 10px var(--plblue);
    }
    .agree-button {
        background-color: green;
        color: white;

    }
    .disagree-button {
        background-color: red;
        color: white;
    }
    .button-div {
        grid-template-columns: 1fr 1fr;
        width: 100%;
        display: grid;
        gap: 2em;
    }
    .a {
        background-image: radial-gradient(#5DC7F5F0, var(--plblue));
    }
    .b {
        background-image: radial-gradient(orangered, red);   
    }
    .b:hover {
        box-shadow: 0 5px 15px orangered;
    }
    .tos-button{
        display: block;
        margin: auto;
        background-color: var(--plblue);
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto; 
        padding: 1rem; 
        border-radius:5px;
    }
</style>
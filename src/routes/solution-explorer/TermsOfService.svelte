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
<div class="body">
<div class="tos-div">
    <button on:click={order} class={tosAccepted ? 'order-acc' : 'order-dec'}>{ tosAccepted ? "Order now": "Order now"}</button>
    
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
</div>
</div>
<style>
    .tos-div {
        display: flex;
        flex-direction: column;
        gap:1em;
        align-items: center;
        
    }
    button {
        background-color: var(--plblue);
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        padding: 1rem; 
        border-radius:5px;
        transition-duration: 1s;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);

    }
    button:hover {
        box-shadow: 0 5px 15px 5px var(--plblue);
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
    .order-acc {
        background-image: radial-gradient(#5DC7F5F0, var(--plblue));
        margin:auto;
    }
    .order-dec {
        background-image: radial-gradient(var(--plblue), grey);
        margin:auto;
    }
    .order-dec:hover {
        box-shadow: 0 5px 15px orangered;
    }
</style>
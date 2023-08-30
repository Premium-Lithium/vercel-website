<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";

    let tosVisible = false;
    let dialog;
    function tosClicked() {
        tosVisible = !tosVisible;
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
    <button class="agree-button">I agree</button>
    <button class="disagree-button">I disagree</button>
</Modal>
    

</div>
<style>
    .agree-button {
        background-color: green;
        color: white;
        border-radius: 1em;
        border: solid 1px black;
    }
    .disagree-button {
        background-color: red;
        color: white;
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
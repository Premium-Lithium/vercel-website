<script>
    import Modal from '$lib/components/Modal.svelte';

    export let showModal = false;
    export let dialog;
    export let noFunc = () => {};
    export let yesFunc = () => {};

</script>

<Modal bind:showModal bind:dialog>
    <div slot="header" class="modal-header">
        <slot name="header"/>
    </div>
    <div class="modal-outer">
        <button on:click={noFunc}>no</button>
        <button on:click={yesFunc}>yes</button>
    </div>
</Modal>
<style>

/* Modal Styles */

.modal-header {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1C2428;
  margin-bottom: 10px;
}

.modal-outer{
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>
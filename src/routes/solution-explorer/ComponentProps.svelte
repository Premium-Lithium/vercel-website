<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

	

    export let id;
    let inputContent;

    function inputChanged() {
        console.log(inputContent);
        console.log(id);
        $page.url.searchParams.set(id, inputContent);

        goto('?' + $page.url.searchParams.toString(), {noScroll: true, keepFocus:true});
    }

</script>


<input bind:value={inputContent} on:input={() => inputChanged()}>
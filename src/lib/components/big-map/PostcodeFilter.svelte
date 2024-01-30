<script lang="ts">
	import FloatingPanel from "./FloatingPanel.svelte"
	import Search from "./Search.svelte"
</script>

<FloatingPanel panelTitle="Filter by Postcode Area">
    <Search/>
	<p>* PO (Portsmouth) had to be split into two - POa is Portsmouth, POb is the Isle of White</p>
</FloatingPanel>
    

<style>
	* {
		max-width: 360px;
	}
</style>
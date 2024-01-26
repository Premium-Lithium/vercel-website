<script lang="ts">
	import FloatingPanel from "./FloatingPanel.svelte"
	import Search from "./Search.svelte"

	export let availablePostcodes: Array<string>
</script>

<FloatingPanel panelTitle="Filter by Postcode Area">
    <Search availablePostcodes={availablePostcodes}/>
</FloatingPanel>
    

<style>

</style>
<script lang="ts">
	import { onMount } from "svelte"

	async function test() {
		await fetch('/report-lookup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify('32932d43-3a23-41ca-933a-6ad3f47567aa'),
		})
	}

    onMount(async () => {
        await test()
    })
</script>

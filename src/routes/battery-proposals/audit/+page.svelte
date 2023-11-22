<script>
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	let isAuthenticated = false

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
	})
</script>

{#if !isAuthenticated}
	<MagicLink bind:isAuthenticated redirectUrl={'battery-proposals/audit'} />
{:else}
	Authenticated
{/if}

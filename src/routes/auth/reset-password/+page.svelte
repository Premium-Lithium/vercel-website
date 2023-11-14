<script>
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	let password = ''
	let error = null
	let success = false
	let loading = false
	let next = ''
	let code = undefined

	onMount(() => {
		// Extract the access token from the URL
		const params = new URLSearchParams(window.location.search)
		next = params.get('next')
		code = params.get('code')
	})

	async function updatePassword() {
		await supabase.auth.exchangeCodeForSession(code)
		try {
			loading = true
			const { error } = await supabase.auth.updateUser(accessToken, {
				password: password
			})
			if (error) throw error
			success = true
			// Redirect after successful password update
			setTimeout(() => goto(next), 3000) // redirect to login page
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}
</script>

<form on:submit|preventDefault={updatePassword}>
	<input type="password" bind:value={password} placeholder="New Password" required />

	{#if error}
		<p style="color: red;">{error}</p>
	{/if}

	{#if success}
		<p style="color: green;">Password updated successfully. Redirecting to login...</p>
	{:else}
		<button type="submit" disabled={loading}>Update Password</button>
	{/if}
</form>

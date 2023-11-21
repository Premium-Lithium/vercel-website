<script>
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

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
		try {
			loading = true
			const { error } = await supabase.auth.updateUser({
				password
			})
			if (error) throw error
			success = true
			// Redirect after successful password update
			await supabase.auth.signOut()
			setTimeout(() => goto(`${$page.url.origin}/${next}`), 1000) // redirect to login page
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}
</script>

<div class="container">
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
</div>

<style>
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		top: 0;
		left: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>

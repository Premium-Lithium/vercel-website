<script>
	import { supabase } from '$lib/supabase'

	let email = ''
	export let redirectLink
	export let isAuthenticated
	export let loading = false
	let errorMessage = ''
	let successful = false

	async function sendMagicEmail() {
		loading = true
		if (!email.endsWith('premiumlithium.com')) return
		const { data, error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false,
				emailRedirectTo: redirectLink
			}
		})
		loading = false
		if (error) {
			errorMessage = error.message
		} else {
			successful = true
		}
	}
</script>

{#if !successful}
	<form on:submit|preventDefault={sendMagicEmail}>
		<input type="email" bind:value={email} placeholder="Email" />
		<button type="submit" disabled={loading}>Login</button>
		<p style="color: red;">{errorMessage}</p>
	</form>
{:else}
	<p>Check your emails for a link to login.</p>
{/if}

<style>
</style>

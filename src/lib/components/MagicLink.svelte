<script>
	import { page } from '$app/stores'
	import { supabase } from '$lib/supabase'

	let email = ''
	export let redirectUrl
	export let isAuthenticated
	export let loading = false
	let errorMessage = ''
	let successful = false

	async function sendMagicEmail() {
		loading = true
		errorMessage = ''
		if (!email.endsWith('premiumlithium.com')) {
			errorMessage = 'Please provide your Premium Lithium email'
			loading = false
			return
		}
		const { data, error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false,
				emailRedirectTo: `${$page.url.origin}/${redirectUrl}`
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

<div class="container">
	{#if !successful}
		<form on:submit|preventDefault={sendMagicEmail}>
			<input type="email" bind:value={email} placeholder="Email" />
			<button type="submit" disabled={loading}>Login</button>
			<p style="color: red;">{errorMessage}</p>
		</form>
	{:else}
		<p>Check your emails for a link to login.</p>
	{/if}
</div>

<style>
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		top: 0;
		left: 0;
		margin: 12px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>

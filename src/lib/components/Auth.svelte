<script>
	import { page } from '$app/stores'
	import { supabase } from '$lib/supabase'
	let email = ''
	let password = ''
	let error = null
	let loading = false
	let forgottenPassword = false

	async function handleLogin() {
		if (forgottenPassword) {
			handleResetPassword()
			return
		}
		try {
			loading = true
			const { error } = await supabase.auth.signInWithPassword({ email, password })
			if (error) throw error
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}

	async function handleSignup() {
		try {
			loading = true
			const { error } = await supabase.auth.signUp({ email, password })
			if (error) throw error
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}
	async function handleResetPassword() {
		const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${$page.url.host}/auth/reset-password`
		})
		if (err) error = err.message
	}
</script>

<div class="container">
	<form on:submit|preventDefault={handleLogin}>
		<input type="email" bind:value={email} placeholder="Email" />
		{#if !forgottenPassword}
			<input type="password" bind:value={password} placeholder="Password" />
		{/if}
		{#if error}
			<p style="color: red;">{error}</p>
		{/if}

		<button type="submit" disabled={loading}
			>{forgottenPassword ? 'Reset Password' : 'Login'}</button
		>
		{#if !forgottenPassword}
			<button type="button" on:click={handleSignup} disabled={loading}>Sign Up</button>
		{/if}
	</form>
	<button
		on:click={() => {
			forgottenPassword = !forgottenPassword
		}}
		class="forgot-password">Forgot password?</button
	>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
	}

	.forgot-password {
		margin-top: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		width: fit-content;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>

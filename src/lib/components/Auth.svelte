<script>
	import { page } from '$app/stores'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'
	export let redirectUrl
	export let authenticated = false
	export let supabaseAuth = undefined
	let email = ''
	let password = ''
	let error = null
	let loading = false
	let forgottenPassword = false
	let sentResetEmail = false
	let sentSignupEmail = false
	async function handleLogin() {
		error = ''
		if (forgottenPassword) {
			handleResetPassword()
			return
		}
		try {
			loading = true
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})
			if (error) throw error
			else {
				supabaseAuth = data
				authenticated = true
			}
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}

	async function handleSignup() {
		try {
			loading = true
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${$page.url.origin}/${redirectUrl}`
				}
			})
			if (error) throw error
			else {
				sentSignupEmail = true
			}
		} catch (err) {
			error = err.message
		} finally {
			loading = false
		}
	}
	async function handleResetPassword() {
		const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${$page.url.origin}/auth/reset-password/?next=${redirectUrl}`
		})
		if (err) error = err.message
		else {
			sentResetEmail = true
		}
	}
</script>

<div class="container">
	{#if sentResetEmail}
		<p>If an account for {email} exists, we've sent you an email to reset your password</p>
	{:else if sentSignupEmail}
		<p>Check your emails for verification to create your account.</p>
	{:else}
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
				error = ''
			}}
			class="forgot-password">Forgot password?</button
		>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		margin: 12px;
	}

	.forgot-password {
		margin-top: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		width: fit-content;
		gap: 1rem;
	}
</style>

<!-- Simple visualisation of the qr code referral system
        Also allows for the creation of QR codes from a name -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { createClient } from '@supabase/supabase-js';
	// TODO put these in env
	const PUBLIC_SUPABASE_ANON_KEY =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnV3bWR5bm92ZGx5b2psdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU3MjE3NzUsImV4cCI6MjAxMTI5Nzc3NX0.PzKOk4uqHBfSRGg8j2LjL0R8WAyp_iBdLckYPEigCvc';
	const PUBLIC_SUPABASE_URL = 'https://tmfuwmdynovdlyojlthe.supabase.co';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	/**
	 * TODO
	 * Create input box for the name and add formatting - John Smith -> john_smith
	 * Find QR code library/API to create the SVGs
	 * Store them in Supabase instead of Drive
	 *  - Create new column in supabase table to store the SVGs
	 * Find a way to render and download them - https://www.npmjs.com/package/qrcode-svg
	 * Represent the Supabase table
	 */

	let clothing: boolean = true,
		card: boolean = false,
		name: string = '',
		baseURL = 'energiser.ai/';

	interface refRow {
		count: number;
		created_at: Date;
		id: number;
		qrcodebase: string;
		qrcodecard: string;
		qrcodeclothes: string;
		referee: string;
	}

	let referralTable: Array<refRow> = [];

	// $: console.log(clothing, card);

	onMount(async () => {
		referralTable = await getReferralTable();
		referralTable.sort((a, b) => a.id - b.id);
		console.log(referralTable);
	});

	// Gets the referrals table from Supabase
	async function getReferralTable() {
		let { data: referrals, error } = await supabase.from('referrals').select('*');
		if (error) {
			console.log(error);
		} else {
			return referrals;
		}
	}

	// Creates a QR code based on the users input
	async function createQRCode() {
		if (name) {
			console.log(clothing, card, name);

			// Creating the QR code link
			let qrCodeURL = baseURL + '?ref=' + name.toLowerCase().replace(/\s/g, '_');
			let qrCodeFileName = name.toLowerCase().replace(/\s/g, '_');

			// Query Params to add based on tracking type
			if (card) {
				qrCodeURL += '&card=1';
				qrCodeFileName += '_card';
			}
			if (clothing) {
				qrCodeURL += '&clothing=1';
				qrCodeFileName += '_clothing';
			}
		}
	}
</script>

<body>
	<div class="layout"> 
		<div class="qrCodeMaker">
			<h2>Internal QR Codes</h2>
			<h3>Create a new QR Code</h3>
			<b>Tracking Options</b>
			<br />
			<br />
			<form class="tracking-form">
				<label>
					<input type="checkbox" name="clothing" bind:checked={clothing} />
					Clothing
				</label>

				<label>
					<input type="checkbox" name="card" bind:checked={card} />
					Business Card
				</label>

				<!-- <label>
        <input type="checkbox" name="" value="">
        ~
    	</label> -->
				<label>
					Name:
					<input type="text" name="username" bind:value={name} />
				</label>
			</form>
			<br />
			<button name="createQR" on:click={createQRCode}>Create QR Code</button>
		</div>
		<div class="referralTable">
			<h2>Referral Counts</h2>
			<!-- Table for referrals -->
			<table>
				<tr>
					<th>ID</th>
					<th>User</th>
					<th>Count</th>
				</tr>
				{#each referralTable as user}
					<tr>
						<td>{user.id}</td>
						<td>{user.referee}</td>
						<td>{user.count}</td>
					</tr>
				{/each}
			</table>
		</div>
	</div>
</body>

<style>
	.tracking-form {
		display: flex;
		flex-direction: column;
	}
</style>

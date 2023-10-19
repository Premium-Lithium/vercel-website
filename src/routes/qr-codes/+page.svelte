<!-- Simple visualisation of the qr code referral system
        Also allows for the creation of QR codes from a name -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { createClient } from '@supabase/supabase-js';
	import { json } from '@sveltejs/kit';
	const PUBLIC_SUPABASE_ANON_KEY =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnV3bWR5bm92ZGx5b2psdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU3MjE3NzUsImV4cCI6MjAxMTI5Nzc3NX0.PzKOk4uqHBfSRGg8j2LjL0R8WAyp_iBdLckYPEigCvc';
	const PUBLIC_SUPABASE_URL = 'https://tmfuwmdynovdlyojlthe.supabase.co';
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	const url = 'https://api.qrserver.com/v1/create-qr-code/?data=';

	/**
	 * TODO
	 * Create input box for the name and add formatting - John Smith -> john_smith DONE
	 * Find QR code library/API to create the SVGs - https://goqr.me/api/doc/create-qr-code/#param_format
	 * Store them in Supabase instead of Drive
	 *  - Create new column in supabase table to store the SVGs DONE
	 * Find a way to render and download them
	 * Represent the Supabase table DONE
	 */

	let name: string = '',
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

	onMount(async () => {
		referralTable = await getReferralTable();
		referralTable.sort((a, b) => a.id - b.id); // Sort by ID
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
			// Creating the QR code link
			let qrCodeURL = baseURL + '?ref=' + name.toLowerCase().replace(/\s/g, '_');
			let qrCodeFileName = name.toLowerCase().replace(/\s/g, '_');

			// Query Params to add based on tracking type
			const cardQrCodeURL = qrCodeURL + '&card=1';
			const cardQrCodeFileName = qrCodeFileName + '_card';
	
			const clotheQrCodeURL = qrCodeURL + '&clothing=1';
			const clotheQrCodeFileName = qrCodeFileName + '_clothing';

			// QR Code maker
			const baseQRbody = JSON.stringify(qrCodeURL);
			const baseQRRes = await fetch(url+encodeURIComponent(baseQRbody)+"&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg");	
			const baseQR = (await baseQRRes.text()).valueOf();

			const clothesQRbody = JSON.stringify(clotheQrCodeURL);
			const clothesQRRes = await fetch(url+encodeURIComponent(clothesQRbody)+"&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg");	
			const clothesQR = (await clothesQRRes.text()).valueOf();
			
			const cardQRbody = JSON.stringify(clotheQrCodeURL);
			const cardQRRes = await fetch(url+encodeURIComponent(cardQRbody)+"&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg");	
			const cardQR = (await cardQRRes.text()).valueOf();
			
		}
	}
</script>

<body>
	<div class="layout">
		<div class="qr-code-maker">
			<h2>Add a new Referee</h2>
			<div class="qr-details">
				<label>
					Name:
					<input type="text" name="username" bind:value={name} />
				</label>
				<button name="createQR" on:click={createQRCode}>Create QR Code</button>
			</div>
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
	.qr-details {
		display: flex;
		flex-direction: row;
	}
</style>

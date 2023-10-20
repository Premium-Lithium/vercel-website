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

	let qrCodeCreated = false;
	let searchMade = false;
	let nameFound = false;
	let nameSearchedFor: string;
	let baseQR: string;
	let clothesQR: string;
	let cardQR: string;
	let lookupBaseQR: string;
	let lookupClothesQR: string;
	let lookupCardQR: string;

	/**
	 * TODO
	 * Create input box for the name and add formatting - John Smith -> john_smith DONE
	 * Find QR code library/API to create the SVGs - https://goqr.me/api/doc/create-qr-code/#param_format DONE
	 * Store them in Supabase instead of Drive
	 *  - Create new column in supabase table to store the SVGs DONE
	 * 	- Store them in supabase
	 * Find a way to render and download them
	 * Represent the Supabase table DONE
	 */

	let addName: string = '',
		lookupName: string = '',
		baseURL = 'https://energiser.ai/';

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
		referralTable.sort((a, b) => b.count - a.count); // Sort by ID
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
		if (addName) {
			// Creating the QR code link
			let qrCodeURL = baseURL + '?ref=' + addName.toLowerCase().replace(/\s/g, '_');

			// Query Params to add based on tracking type
			const cardQrCodeURL = qrCodeURL + '&card=1';

			const clotheQrCodeURL = qrCodeURL + '&clothing=1';

			// QR Code maker
			const baseQRbody = JSON.stringify(qrCodeURL);
			const baseQRRes = await fetch(
				url + encodeURIComponent(baseQRbody) + '&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg'
			);
			baseQR = (await baseQRRes.text()).valueOf().replace(/<\?xml[^>]*\?>/, '');
			console.log(baseQR);

			const clothesQRbody = JSON.stringify(clotheQrCodeURL);
			const clothesQRRes = await fetch(
				url +
					encodeURIComponent(clothesQRbody) +
					'&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg'
			);
			clothesQR = (await clothesQRRes.text()).valueOf().replace(/<\?xml[^>]*\?>/, '');

			const cardQRbody = JSON.stringify(cardQrCodeURL);
			const cardQRRes = await fetch(
				url + encodeURIComponent(cardQRbody) + '&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg'
			);
			cardQR = (await cardQRRes.text()).valueOf().replace(/<\?xml[^>]*\?>/, '');

			// TODO add the created QR codes to the database
			// TODO allow user to download QR codes from the lookup (+ zip the codes first)
			// TODO allow user to download all QR codes (+ zip codes first)
			qrCodeCreated = true;
		}
	}

	function lookupQRCode() {
		if (lookupName) {
			searchMade = true;
			nameSearchedFor = lookupName;
			for (let entry in referralTable) {
				if (referralTable[entry].referee === lookupName.toLowerCase()) {
					nameFound = true;
					lookupBaseQR = referralTable[entry].qrcodebase;
					lookupCardQR = referralTable[entry].qrcodecard;
					lookupClothesQR = referralTable[entry].qrcodeclothes;
				}
			}
		}
	}
</script>

<body>
	<div class="title">
		<h1>Internal Referral Tracking and Lookup</h1>
		<div class="layout">
			<div class="referral-table">
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
			<div class="qr-lookup">
				<h2>QR Code Lookup</h2>
				<div class="lookup-input">
					<label>
						Name:
						<input type="text" name="username" bind:value={lookupName} />
					</label>
					<button name="createQR" on:click={lookupQRCode}>Lookup QR Codes</button>
				</div>
				<div class="lookup-output">
					{#if searchMade}
						{#if nameFound}
							<p>QR Codes for {nameSearchedFor}</p>
							<div class="qr-code-lookup-render">
								{#each [['Base QR Code', lookupBaseQR], ['Business Card QR Code', lookupCardQR], ['Clothing QR Code', lookupClothesQR]] as qr}
									<div class="qr-code-lookup-element">
										<b>{qr[0]}</b>
										{#if qr[1]}
											{@html qr[1]}
										{:else}
											<p>No QR Code Found</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<b>{nameSearchedFor} not found</b>
						{/if}
					{/if}
				</div>
			</div>
			<div class="qr-code-maker">
				<h2>Add a new Referee</h2>
				<div class="qr-details">
					<label>
						Name:
						<input type="text" name="username" bind:value={lookupName} />
					</label>
					<button name="createQR" on:click={createQRCode}>Create QR Code</button>
				</div>
				<div class="qr-render">
					{#if qrCodeCreated}
						<div class="qr-codes">
							<div class="base-qr">
								<h3>Base QR Code</h3>
								<div class="base-qr-render">{@html baseQR}</div>
							</div>
							<div class="clothes-qr">
								<h3>Clothes QR Code</h3>
								<div class="clothes-qr-render">{@html clothesQR}</div>
							</div>
							<div class="card-qr">
								<h3>Card QR Code</h3>
								<div class="card-qr-render">{@html cardQR}</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</body>

<style>
	.layout {
		padding: 2%;
		display: flex;
		flex-direction: row;
	}

	.referral-table {
		padding: 10px;
		width: 15%;
		border-right: 3px solid black;
	}

	.qr-code-maker {
		padding: 10px;
		padding: 10px;
	}
	.qr-details {
		display: flex;
		flex-direction: row;
		padding: 10px;
	}

	.qr-lookup {
		display: flex;
		width: 60%;
		flex-direction: column;
		padding: 10px;
		border-right: 3px solid black;
	}

	.qr-render {
		width: 25%;
	}

	.qr-codes {
		display: flex;
		width: 100%;
		flex-direction: column;
		padding: 10px;
	}

	.qr-code-lookup-render {
		display: flex;
		flex-direction: row;
	}

	.qr-code-lookup-element {
		display: flex;
		flex-direction: column;
	}
</style>

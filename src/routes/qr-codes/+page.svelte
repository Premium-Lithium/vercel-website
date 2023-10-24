<!-- Simple visualisation of the qr code referral system
        Also allows for the creation of QR codes from a name -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { createClient } from '@supabase/supabase-js';
	import { json } from '@sveltejs/kit';
	import FileSaver, { saveAs } from 'file-saver'
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
	 * Store them in Supabase instead of Drive DONE
	 *  - Create new column in supabase table to store the SVGs DONE
	 * 	- Store them in supabase DONE
	 * Find a way to render and download them
	 * Represent the Supabase table DONE
	 * Allow user to download all QR codes
	 * 	- button at top of screen to bulk download all files
	 * 	- put each persons qr codes into a folder under their name
	 * 	- put each folder into a single qr code folder and zip it
	 * 	- download the file
	 * Allow user to download an individuals qr codes
	 * 	- button that appears after qr code lookup
	 * 	- put the persons qr codes into a folder and zip it
	 * 	- download the file
	 * Add error message to display whenever there is an error
	 */

	downloadFile("test");

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

	async function qrCodeMaker(base: string, id: string) {
		const qrOptions = '&color=0-0-0&bgcolor=255-255-255&qzone=4&format=svg'
		const qrBody = JSON.stringify(base + "&id=" + id);
		const qrRes = await fetch(url + encodeURIComponent(qrBody) + qrOptions)
		const qrCode = (await qrRes.text()).valueOf().replace(/<\?xml[^>]*\?>/, '');

		return qrCode
	}

	// Creates a QR code based on the users input
	async function createQRCode() {
		if (addName) {
			// Creating the QR code link
			let qrCodeURL = baseURL + '?ref=' + addName.toLowerCase().replace(/\s/g, '_');

			// Query Params to add based on tracking type
			baseQR = await qrCodeMaker(qrCodeURL, '0');
			clothesQR = await qrCodeMaker(qrCodeURL, '1');
			cardQR = await qrCodeMaker(qrCodeURL, '2');

			qrCodeCreated = true;
		}
	}

	async function saveQRCode() {
		let count = 0;
		for (let entry in referralTable) {
			if (referralTable[entry].referee === addName.toLowerCase()) {
				console.log(referralTable[entry].referee)
				count = referralTable[entry].count;
				break;
			}
		}

		const { data, error } = await supabase
			.from('referrals')
			.upsert([
				{
					referee: addName.toLowerCase(),
					count: count,
					qrcodebase: baseQR,
					qrcodeclothes: clothesQR,
					qrcodecard: cardQR
				}
			], {onConflict: 'referee', ignoreDuplicates: false})
			.select();
		if (error) {
			console.log(error);
		} else {
			// Need to reload 
			location.reload();
		}
	}

	async function downloadFile(file) {
		let fileSaved = saveAs(file, "QRCodes.zip");
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
				<h2>QR Code Lookup and Download</h2>
				<div class="lookup-input">
					<p>Type in a name to look them up on the database, and if they are in the database you can download their QR codes</p>
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
											<p>No QR Code Found!</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<b>{nameSearchedFor} not found! Check spelling, or add this person in the right hand panel!</b>
						{/if}
					{/if}
				</div>
			</div>
			<div class="qr-code-maker">
				<h2>Add a new Referee</h2>
				<p>Create a set of QR codes for a new referee, and then choose to add them to the database</p>
				<p>Duplicates are automatically ignored - no need to worry about putting in a name twice
				</p>
				<div class="qr-details">
					<label>
						Name:
						<input type="text" name="username" bind:value={addName} />
					</label>
					<button name="createQR" on:click={createQRCode}>Create QR Code</button>
					{#if qrCodeCreated}
						<button name="saveQR" on:click={saveQRCode}>Save User to Database</button>
					{/if}
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
		width: 42.5%;
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
		width: 42.5%;
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

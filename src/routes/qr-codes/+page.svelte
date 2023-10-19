<!-- Simple visualisation of the qr code referral system
        Also allows for the creation of QR codes from a name -->

<script lang="ts">
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
		name: string = "",
		baseURL = "energiser.ai/";

	// $: console.log(clothing, card);

	async function createQRCode() {
		if (name) {
			console.log(clothing, card, name);

			// Creating the QR code link
			let qrCodeURL = baseURL + "?ref=" + name.toLowerCase().replace(/\s/g, '_');
			let qrCodeFileName = name.toLowerCase().replace(/\s/g, '_');

			// Query Params to add based on tracking type
			if (card) {
				qrCodeURL += "?card=1";
				qrCodeFileName += "_card";
			}
			if (clothing) {
				qrCodeURL += "?clothing=1";
				qrCodeFileName += "_clothing";
			}
		}
	}
</script>

<body>
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
</body>

<style>
	.tracking-form {
		display: flex;
		flex-direction: column;
	}
</style>

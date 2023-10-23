<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import { writable } from 'svelte/store';
	import { json } from '@sveltejs/kit';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { accessToken } from '$lib/payment-info-panel/sessionStore';

	//const dealId = $page.url.searchParams.get('selectedIds'); //dealID in payload is called selectedIds
	const dealId = 7142;
	const userId = $page.url.searchParams.get('userId'); //userId
	const tempCode = $page.url.searchParams.get('code'); //accessToken is passed thru URL for now (not a really good idea)

	let currentPlan;
	let totalPaid = writable(0);
	let price = 0;
	let sdk;
	let formattedPrice;
	let totalPaidFormatted;
	let authUrl;
	let xeroPdfData;
	let safetyCulturePdfLink;

	//TO DO - deploy the panel on branch deployment
	//Add authentication for users permmissions.
	const managerList = ['15970437']; // for testing purposes I'm using my userId (Nicholas Dharmadi)
	const authenticated = managerList.includes(userId);

	let invoice = {
		id: '',
		value: '',
		info: '',
		date: ''
	};

	const dummyInvoices = [
		{
			id: 1,
			value: 1000,
			info: 'First Payment',
			date: '18/10/23'
		},
		{
			id: 2,
			value: 5000,
			info: 'Second Payment',
			date: '19/10/23'
		},
		{
			id: 3,
			value: 500,
			info: 'Third Payment',
			date: '20/10/23'
		}
	];

	onMount(async () => {
		sdk = await new AppExtensionsSDK().initialize();
		await sdk.execute('resize', { height: 315 });
	});

	onMount(() => {
		if (dealId && tempCode) {
			getPaymentInfo();
			updateTotalPaidFrom(dummyInvoices);
			console.log('ALL PASS');
		} else {
			console.log('temp pass');
			getAuthLink();
		}
	});

	async function getAuthLink() {
		try {
			//Get the Auth login link
			const response = await fetch('/payment-info-panel');
			const responseData = await response.json();
			authUrl = responseData;
		} catch (error) {
			console.log('Error');
		}
	}

	async function getPaymentInfo() {
		try {
			const response = await fetch('/payment-info-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId,
					tempCode: tempCode
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				console.log('Received:', responseData);
				currentPlan = responseData.paymentData.plan;
				price = responseData.paymentData.price;
				xeroPdfData = responseData.buffer.data;
				safetyCulturePdfLink = responseData.safetyCulturePdfLink
			}
		} catch (error) {
			console.log(error);
		}
	}

	function updateTotalPaidFrom(invoices) {
		let total = 0;
		for (let i in invoices) {
			total += invoices[i].value;
		}
		totalPaid.set(total);
	}

	$: {
		totalPaidFormatted = $totalPaid.toLocaleString();
		formattedPrice = price.toLocaleString();
	}
</script>

<div class="payment-panel">
	<h3>Payment</h3>
	<div class="header">
		<a href={authUrl} class="link-btn invoice">Generate Xero Invoice From Deal</a>
		<a href={safetyCulturePdfLink} class="link-btn safetyculture">Download SafetyCulture PDF</a>
	</div>
	{#if xeroPdfData}
		<a
			href={URL.createObjectURL(new Blob([new Uint8Array(pdfData).buffer]))}
			download="invoice.pdf"
		>
			Download Invoice PDF
		</a>
	{/if}
	{#if safetyCulturePdfLink}
		<a
			href={safetyCulturePdfLink}
			download="site-survey.pdf"
		>
			Download Site Survey PDF
		</a>
	{/if}

	<hr />
	<div class="plan">
		<p>Plan: {currentPlan}</p>
	</div>
	<hr />
	<div class="payment-details">
		{#each dummyInvoices as invoice}
			<div>{invoice.info}</div>
			<div>{invoice.date}</div>
			<div>£{invoice.value}</div>
		{/each}
	</div>
	<hr />
	<div class="progress">
		<div class="bar">
			<ProgressBar width={$totalPaid / price} label="£{totalPaidFormatted} / £{formattedPrice}" />
		</div>
	</div>
	<hr />
	
	{#if authenticated}
		<div class="manager-view">
			<p>Margin: Profit:</p>
		</div>
	{/if}
</div>

<style>
	.payment-panel {
		padding: 15px;
		border: 0px solid grey;
	}

	.header {
		display: grid;
		grid-template-columns: 50% 50%;
	}

	.payment-details {
		display: grid;
		grid-template-columns: auto auto auto;

		& div {
			padding: 2px;
		}
	}

	.link-btn {
		background-color: #939393;
		color: white;
		text-decoration: none;
		text-align: center;
		padding: 10px;
		margin: 10px;
		border-radius: 10px;

		&.invoice {
			background-color: #373376;
		}
	}
</style>

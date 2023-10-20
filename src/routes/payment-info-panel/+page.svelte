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
		} else if (tempCode) {
			console.log('temp pass');
		}
	});

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
		<a
			href="https://login.xero.com/identity/connect/authorize?client_id=58566968C54B401F82854F6C633E43B5&scope=openid%20profile%20email%20accounting.transactions%20offline_access&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fpayment-info-panel"
			class="link-btn invoice">Generate Invoice</a
		>
		<a
			href="https://login.xero.com/identity/connect/authorize?client_id=58566968C54B401F82854F6C633E43B5&scope=openid%20profile%20email%20accounting.transactions%20offline_access&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fpayment-info-panel"
			class="link-btn">Sync</a
		>
	</div>

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
		grid-template-columns: auto auto;
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

		&.invoice {
			background-color: #373376;
		}
	}
</style>

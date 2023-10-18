<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';
	import { writable } from 'svelte/store';
	import { json } from '@sveltejs/kit';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	const dealId = $page.url.searchParams.get('selectedIds'); //dealID in payload is called selectedIds
    const userId = $page.url.searchParams.get('userId'); //userId
	let currentPlan;
	let totalPaid = writable(0);
	let price = 0;
	let sdk;
	let formattedPrice;
	let totalPaidFormatted;

    //Add authentication for users permmissions.
    const managerList = ["15970437"];
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
        const context = await sdk.data.getContext();
        console.log("SDK", context);
	});

	onMount(() => {
        console.log($page.url.pathname)
        console.log("DealId", dealId)
		if (dealId) {
			getPaymentInfo();
			updateTotalPaidFrom(dummyInvoices);
		}
	});

	async function getPaymentInfo() {
		try {
			const response = await fetch('/payment-info-panel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dealId: dealId
				})
			});
			if (response.ok) {
				const responseData = await response.json();
				console.log('Received:', responseData);
				currentPlan = responseData.plan;
				price = responseData.price;
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
		padding: 0 15px;
		border: 0px solid grey;
	}

	.payment-details {
		display: grid;
		grid-template-columns: auto auto auto;
        
        & div {
            padding: 2px;
        }
	}
</style>

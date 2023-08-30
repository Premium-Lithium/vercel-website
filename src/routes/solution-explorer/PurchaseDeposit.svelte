<script lang="ts">
	//Test admin key: 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
	import '@shopify/shopify-api/adapters/web-api';
	import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
	import Client from 'shopify-buy';

	// Button
	import PurchaseButton from '$lib/components/PurchaseButton.svelte';

	//Todo - don't have details hardcoded
	const shopify_apiKey = '3c53bc6cca0f0c0253b4853e0dafce90';
	const shopify_domain = 'premium-lithium-limited.myshopify.com';

	let current_checkout;

	// Build client - link this instance to the target store
    const client = Client.buildClient({
		domain: shopify_domain,
		storefrontAccessToken: shopify_apiKey
	});

	// Retrieve shop and product info
	const shopInfo = client.shop.fetchInfo();
	const products = client.product.fetchAll()

	// Fetch the checkout or create a new one if not defined
	if (current_checkout) {
		client.checkout.fetch(current_checkout.id).then((checkout) => {
			current_checkout = checkout
		});
	} else {
		createCheckout() 
	}

	// Create a checkout
	function createCheckout() {
		client.checkout.create().then((checkout) => {
      	current_checkout = checkout;
    	});
	}

	function findProduct(productName) {
		return products.find(productName).id;
	}

	function addItemsToCart(productName, current_checkout) {
		const itemsToAdd {
			variantID: findProduct(productName),
			quantity: 1, //only 1 purchase at a time as product is a deposit
		};
		client.checkout.addLineItems(current_checkout.id, itemsToAdd);
	}

</script>

<!-- Button todo export onclick signal at some point-->
<body>
	<PurchaseButton />
</body>

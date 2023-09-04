<script lang="ts">
	import '@shopify/shopify-api/adapters/node';
	import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
	import { restResources } from '@shopify/shopify-api/rest/admin/2023-04';
	import express from 'express';

	// Button
	import PurchaseButton from '$lib/components/PurchaseButton.svelte';

	const shopify_apiKey = '3c53bc6cca0f0c0253b4853e0dafce90';
	const shopify_apiSecretKey = '3c53bc6cca0f0c0253b4853e0dafce90';
	const shopify_adminAccessToken = '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';
	const shopify_domain = 'premium-lithium-limited.myshopify.com';

	/**
	 * Shopify initialisation
	 *	- connects to the custom app (deposit-test) on shopify
	 *	-
	 */
	const shopify = shopifyApi({
		apiSecretKey: shopify_apiSecretKey,
		apiVersion: ApiVersion.July23,
		isCustomStoreApp: true,
		adminApiAccessToken: shopify_adminAccessToken,
		isEmbeddedApp: true,
		hostName: shopify_domain,
		scopes: ['read_inventory', 'read_product_listings', 'read_products', 'read_purchase_options'],
		restResources
	});

	/**
	 * Begins the shopify session
	 */ 
	const session = shopify.session.customAppSession(shopify_domain);

	/**
	 * OAuth process - begin
	 * 	- if the sessions scope is not the same as the shopify scope then redo the auth process
	 * 	- 
	 */
	async function authProcessBegin(req, res) {
		if (!shopify.config.scopes.equals(session.scope)) {
			let shopVar = shopify.utils.sanitizeShop(session.shop, true) !== null ? String(shopify.utils.sanitizeShop(session.shop, true)) : '';
			await shopify.auth.begin({
				shop: shopVar,
				callbackPath: '',
				isOnline: false, // only comes here if the scope has changed so will be offline
				rawRequest: req,
				rawResponse: res
			})
		}
	}

	/**
	 * OAuth process - callback
	 * 	- after the app installation is approved in auth.begin
	*/
	async function authProcessCallback(req, res) {
		const callback = await shopify.auth.callback({
			rawRequest: req,
			rawResponse: res,
		});
	}


</script>

<!-- Button todo export onclick signal at some point-->
<body>
	<PurchaseButton />
</body>

<script lang="ts">
	import '@shopify/shopify-api/adapters/web-api';
	import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

	const shopify_apiKey = '3c53bc6cca0f0c0253b4853e0dafce90';
	const shopify_secretApiKey = '5ed4c35759414e6f6b0c835d6f8944bc';
	const shopify_scope = ['read_products'];
	const shopify_hostname = 'localhost:3000';
	//let shopify_shop;

	// Shopify API
	/*
        Test admin key: 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
        Todo - don't have details hardcoded
             - OAuth process
    */
	const shopify = shopifyApi({
		apiKey: shopify_apiKey, // key from partners dashboard, string
		apiSecretKey: shopify_secretApiKey, // secret key from partners dashboard, string
		scopes: shopify_scope, // products on shopify app, array
		hostName: shopify_hostname, //just for testing, might be premiumlithium.com, string
		apiVersion: LATEST_API_VERSION, // imported from @shopify api
		isEmbeddedApp: true //shopify admin, bool
	});

	/*
        Todo get this working for this project - currently just an example 
            Look into Request Docs
            Look into Response Docs
    */
	async function handleFetch(request: Request): Promise<Response> {
		const { searchParams } = new URL(request.url);
		return shopify.auth.begin({
			shopify_shop: shopify.utils.sanitizeShop(searchParams.get(shopify_hostname), true),
			callbackPath: '/auth/callback',
			isOnline: false,
			rawRequest: request
		});
	}

	// function detectScopeChange() {
	// 	if (!shopify.config.scopes.equals(session.scope)) {
	// 		// Scopes have changed, the app should redirect the merchant to OAuth
	// 	}
	// }
</script>

<!-- Button todo export onclick signal at some point-->
<div>
	<label for="purchaseBtn" />
	<input type="button" value="Purchase" id="purchaseBtn" />
</div>

<h2>Purchase Order</h2>

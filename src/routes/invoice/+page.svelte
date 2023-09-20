<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  let product = {};
  let customer = {};
  let invoice = {};
  let solution = {};
  let panel = {};

  const deal_id = $page.url.searchParams.get('dealId');
  
  onMount(() => {
    //if deal_id is present in the URL, set that as initial value
    if (deal_id) {
      retrieveProductInfo();
    }
  });

  async function retrieveProductInfo(){
    try {
      const response = await fetch('/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({dealId: deal_id})
            });
      if(response.ok){
        invoice = await response.json();
        product = invoice.productInfo;
        customer = invoice.customer;
        solution = invoice.customer.solution;
        panel = invoice.panelPrice;
        console.log("Product:", product);
        console.log("Customer:", customer);
        console.log("Solution:", solution);
        console.log("Panel Price:", panel)
      }
    } catch (error) {
      console.error('Error', error);
    }
  }
  
</script>

<main>
  <h1>Invoice</h1>
  <p>To:</p> 
  <p>{customer.name}</p>
  <p>{customer.email}</p>
  <p>Name: {product.name}</p>
  <p>Price: £{product.price}</p>
  <p>Warranty: {product.warranty}</p>
  <p>Installation Date: {solution.installMonth}</p>
  <p>Number of Panels: {panel.panel} | Cost: {panel.price}</p>
</main>
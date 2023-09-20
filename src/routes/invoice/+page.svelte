<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';


  let price = "";
  const deal_id = $page.url.searchParams.get('dealId');
  
  onMount(() => {
    //if deal_id is present in the URL, set that as initial value
    if (deal_id) {
      retrieveProductPrice();
    }
  });

  async function retrieveProductPrice(){
    try {
      const response = await fetch('/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({dealId: deal_id})
            });
      if(response.ok){
        price = await response.json();
        console.log("Price:", price);
      }
    } catch (error) {
      console.error('Error', error);
    }
  }
  
</script>

<main>
  <h1>Invoice</h1>
  <p>Price: £{price} </p>
</main>
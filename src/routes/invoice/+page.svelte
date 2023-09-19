<script>
  import { supabase } from '$lib/supabase.ts';
  import { onMount } from 'svelte';
  //This import is causing the 500 Internal Error
  //import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js'  

  //let deal_id = "";
  let deal_id_text = "";
  let deal_value_text = "";
  let battery_size = "";
  const battery_size_hashed = "567489c8ee63a1e43f24caedcbd9ce1398c63317"

  async function retrieveDealData(deal_id) {
    const PIPEDRIVE_API_TOKEN = "77a5356773f422eb97c617fd7c37ee526da11851";
    const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";
    const endpoint = `${PIPEDRIVE_API_URL}/deals/${deal_id}?api_token=${PIPEDRIVE_API_TOKEN}`;
    
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      battery_size = await getSpecificFieldFromDeal(data, battery_size_hashed);
      console.log('Deal Data:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getSpecificFieldFromDeal(data, field_name) {
    return data.data[field_name]
  }

  onMount(() => {
    //parsing query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlDealId = urlParams.get('dealId');

    //if deal_id is present in the URL, set that as initial value
    if (urlDealId) {
      retrieveDealData(urlDealId);
    }
  });
</script>

<main>
  <h1>Invoice</h1>
  <!--
  <form>
    <label for="deals_id">Deal ID:</label>
    <input type="text" id="deals_id" bind:value={deal_id} />

    <label for="custom_field">Custom Field:</label>
    <p>{custom_field}</p>
    <button type="submit" on:submit={submitForm}>Extract</button>
  </form>
  -->
  <p>Value: {battery_size} kWh</p>
</main>
<script>
    export let totalSavings = 0;
    export let paybackTime = 0;
    export let energySavings = 0;

    const currency = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
</script>

<table>
    <tr>
        <td>Total</td>
        <td><b>{currency.format(totalSavings)}</b></td>
    <tr>
    <tr>
        <td>Payback</td>
        <td><b>{currency.format(paybackTime)}</b></td>
    <tr>
    <tr>
        <td>Energy savings</td>
        <td><b>{currency.format(energySavings)}</b></td>
    <tr>
</table>
<div class="helptext"> These are estimates. We'll arrange a site survey for you for the most accurate information.</div>

<style>
    .body {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        background: rgb(236, 236, 236); 
    }

    h3{
        color: #28AAE2;
    }
    
    .buttons{
        align-items: center;
    }

    button{
        background-color: var(--plblue);
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto; 
        padding: 1rem; 
        margin:30px; 
        border-radius:5px;
        
    }

    table {
        margin-left: 2rem;
        margin-right: 2rem;
        margin-top: 1rem;
        font-size: 1.5rem;
    }

    tr, td {
        padding-right: 0.5rem;
        padding-left: 0.5rem;
    }

    .helptext {
        margin: 1rem;
        color: var(--plblue);
    }

</style>

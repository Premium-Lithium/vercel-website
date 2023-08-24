<script>
     export let totalSavings = 0;
     export let paybackTime = 0;
     export let energySavings = 0;
    
    async function order(){
        console.log("ordering ")
    }

    async function contactUs(){
        console.log("contacting")
    }

</script>

<div class=body>
    <table>
        <tr>
            <td>Total</td>
            <td>{totalSavings}</td>
        <tr>
        <tr>
            <td>Payback</td>
            <td>{paybackTime}</td>
        <tr>
        <tr>
            <td>Energy savings</td>
            <td>{energySavings}</td>
        <tr>
        <h2> Energy Savings: {energySavings} kWh /year</h2>
        <h3> These are estimates. We'll arrange a site survey for you for the most accurate information.</h3>
    </table>
    <div class=buttons>
        <button type="submit" on:click={contactUs}>Contact us</button>
        <button type="submit" on:click={order}>Order Now</button>
    </div>
</div>

<style>
    .body {
        margin: 0;
        width: 100vw;
        height: 100vh;
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
        background-color: #28AAE2;
        color: white;
        border:solid #000 1px; 
        font-size: 20px;
        height:auto; 
        width:100px; 
        padding:10px 5px; 
        margin:30px; 
        border-radius:5px;
        
    }

</style>

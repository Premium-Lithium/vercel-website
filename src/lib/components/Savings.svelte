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
    <h1> Your Savings: </h1>
    <h2> Total: £ {totalSavings} </h2>
    <h2> Payback Time: {paybackTime} years</h2>
    <h2> Energy Savings: {energySavings} kWh /year</h2>
    <h3> These are estimates. We'll arrange a site survey for you for the most accurate information.</h3>
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
        color: #28AAE2
    }

    hr{
        color:  #000;
    }

    .buttons{
        align-items: center;
    }

    button{
        background-color: #28AAE2;
        color: white;
        border:solid #000 1px; 
        font-size: 30px;
        height:auto; 
        width:200px; 
        padding:10px 5px; 
        margin:30px; 
        border-radius:5px;
        
    }

</style>
<script>
    export let quote;
    export let autofocus = false;
    export let placeholder;
</script>


<input name="quote-input" type="number" 
        autofocus = {autofocus}
        placeholder={placeholder}
        id="submit-quote"
        required
        min=0
        max=999999999.99
        on:blur={() => {if(quote) {quote = (Math.max(0.00,quote)).toFixed(2)}}}
        step="0.01"
        bind:value={quote}
    >


    <style>
        input[type="number"] {
            min-width:60%;
            margin: 15px;
            border: 1px solid #000;
            height: 60px;
            text-align: center;
            font-size: 2.5em;   
            font-family: 'Roboto', sans-serif;
            border-radius: 3px;
            display:inline-block;
            right: 0;
        }

        input:valid {
            border: 2px solid #28AAE2;
            transition: border-color 0.6s ease-in-out;

        }

        input:invalid {
            border: solid 2px black;
            transition: border-color 0.1s ease-in-out;
        }

        input:focus {
            outline: none;
        }
    </style>
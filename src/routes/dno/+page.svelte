<script lang="ts">


    async function getDNOFromPostCode() {
        let res = await fetch("/dno")

        const networkOperator = await res.json()
    }

</script>

<button on:click={getDNOFromPostCode}>Submit</button>
<script lang="ts">

// For testing
async function button() {
    console.log("button")
    let res = await fetch('/report-lookup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'option': 1,
            'analyticStage': 0,
            'uuid': '32932d43-3a23-41ca-933a-6ad3f47567aa',
        })
    })
    console.log(await res.json())
}

</script>

<button on:click={button} >Test</button>

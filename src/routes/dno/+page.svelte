<script lang="ts">

    let postcode: string = ""

	async function getDNOFromPostCode(postcode: string) {
		postcode = 'YO1 7NP'; // 

		let res = await fetch('/dno', {
			method: 'POST',
			body: JSON.stringify({
				'postcode': postcode
			}),
			headers: {
				'Content-Type': 'application/json'
			}
        })

		const networkOperator = await res.json();
	}
</script>

<button on:click={() => getDNOFromPostCode(postcode)}>Submit</button>

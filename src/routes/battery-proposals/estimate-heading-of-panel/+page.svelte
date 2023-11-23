<script>
	import { onMount } from 'svelte'

	onMount(async () => {
		let res = await fetch(`/battery-proposals/estimate-heading-of-panel`, {
			method: 'POST',
			body: JSON.stringify({
				'lat': 53.9572511,
				'lon': -1.05389006
			})
		})
		console.log(res)
	})
</script>

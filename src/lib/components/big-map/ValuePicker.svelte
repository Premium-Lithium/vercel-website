<script lang="ts">
	export let value: number
	export let label: string
</script>

<div class={'value-picker'}>
	<div class="label">
		<p>{label}</p>
	</div>
	<div class="picker">
		<input type="number" class="value-picker" bind:value />
	</div>
</div>

<style>
	
</style>

<script lang="ts">
    
    async function generateDNO() {

    }

	async function generateContract() {

	}

</script>

<div class="dno-panel">
	<button class="link-btn" on:click={generateDNO}
		>Generate DNO Application</button
	>
	<button class="link-btn" on:click={generateContract}
		>Generate Contract</button
	>
</div>

<style>
    .dno-panel {
		padding: 15px;
		/* border: 1px solid grey; */
		display: grid;
	}

	.link-btn {
		background-color: #c6c6c6;
		color: black;
		text-align: center;
		padding: 10px;
		margin: 10px 0;
		border-radius: 10px;
		border: 1px solid black;
		cursor: pointer;
		font-weight: bold;
		font-size: 16px;
		&:hover {
			background-color: #9f9f9f;
		}
		&:disabled {
			cursor: default;
			background-color: rgb(101, 101, 101);
		}
	}
</style>
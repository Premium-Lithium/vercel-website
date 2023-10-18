<script>
	export let width;
	export let label;
</script>

<div class="wrapper">
    <div class="progress-bar">
		<span class="progress-bar-fill" style="width: {width * 100}%" />
	</div>
    <div class="progress-label">
        {label}
    </div>
</div>

<style>
	.wrapper {
		width: 100%;
	}
	.progress-bar {
		background: #eeeeee;
		border-style: solid;
		border-color: rgb(205, 205, 205);
		padding: 3px;
		border-radius: 10px;
	}
	.progress-bar-fill {
		display: block;
		height: 10px;
		background-color: #28aae2;
		border-radius: 10px;
	}
    .progress-label {
        padding: 5px 0;
        text-align: right;
    }
</style>

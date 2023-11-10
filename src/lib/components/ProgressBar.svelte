<script>
    export let width; 
    export let stage;
</script>

<div class="wrapper">
    <span>{stage}</span>
    <div class="progress-bar">
        <span class="progress-bar-fill" style="width: {width}"></span>
    </div>
</div>

<style>
    .wrapper {
        width: 300px;
    }
    .progress-bar {
        width: 100%;
        background: #eeeeee;
        border-style: solid;
        border-color: rgb(205, 205, 205);
        padding: 3px;
        border-radius: 5px;
    }
    .progress-bar-fill {
        display: block;
        height: 10px;
        background-color: #28AAE2;
        border-radius: 5px;
    }
</style>
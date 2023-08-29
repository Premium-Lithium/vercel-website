<script lang="ts">
    export let titles = [];
    export let selectedIndex = 0;

    import ChevronRight from "svelte-material-icons/ChevronRight.svelte"

</script>

<div class="container">
    {#each titles as title, i}
        <div class={(i === selectedIndex) ? "highlight" : ""}>
            <div class="title" on:click={() => {selectedIndex = i}}>
                {title}
            </div>
        </div>
        {#if i != titles.length-1}
        <div class="icon-protector">
            <ChevronRight size="2em" />
        </div>
        {/if}
    {/each}
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        gap: .5rem;
        padding: 1rem;
        align-items: center;
        box-shadow: 0px 2px 10px 2px rgba(0, 0, 0, 0.2);
        overflow-x: auto;
    }

    .title {
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .icon-protector {
        min-width: 2em;
    }

    .highlight {
        border-bottom: solid;
        min-height: 100%;

    }
</style>

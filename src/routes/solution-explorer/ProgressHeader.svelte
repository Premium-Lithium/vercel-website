<script lang="ts">
    export let titles = [];
    export let selectedIndex = 0;

    import ChevronRight from "svelte-material-icons/ChevronRight.svelte"

</script>

<div class="container">
    {#each titles.slice(0, -1) as title, i}
        <div class={(i === selectedIndex) ? "highlight" : ""}>
            <div class="title">
                {title}
            </div>
        </div>

        <div class="icon-protector">
            <ChevronRight size="2em" />
        </div>
    {/each}
    <div class={(selectedIndex === (titles.length-1)) ? "highlight" : ""}>
        <div class="title">
            {titles.at(-1)}
        </div>
    </div>
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
    }

    .icon-protector {
        min-width: 2em;
    }

    .highlight {
        border-bottom: solid;
        min-height: 100%;

    }
</style>

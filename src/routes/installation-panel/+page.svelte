<script>
    import { onMount, tick } from 'svelte';
    import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

    let sdk;
    let selectedPhase=[];
    onMount(async () => {
        sdk = await new AppExtensionsSDK().initialize();
        await sdk.execute('resize', { height: 100 });
    });

    let phases = [
        'Stage 1',
        'Stage 2',
        'Stage 3',
        'Stage 4',
        'Stage 5',
        'Stage 6',
        'Stage 7',
        'Stage 8'
    ]

</script>

<div class="project-panel">
    <form>
        <p>selected: {selectedPhase}</p>
        <ol type="1">
            {#each phases as phase}
                <li>
                    <label>
                        {phase}
                        <input type="checkbox" value={phase} bind:group={selectedPhase}>
                    </label>
                </li>
            {/each}
        </ol>
    </form>
</div>
<style>
    .project-panel{
        list-style: none;
        padding: 0px 15px;
    }
</style>
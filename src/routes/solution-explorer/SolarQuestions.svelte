<script lang="ts">

	export let allQueryParameters;

    // Booleans just for showing/hiding options
    let hasSolarYes = false;
    let hasSolarNo = false;
    // Todo put the following variables into allQueryParameters
    let wantsSolarYes;
    let wantsSolarNo;
    let panelsWanted = 0;
    let energyGeneration = 0;

    function switchOptions() {
        hasSolarNo = !hasSolarNo;
        hasSolarYes = !hasSolarYes;
    }

</script>

<div>
    <h2>Solar Questions Placeholder Text</h2>
	<p>Do you already have Solar?</p>
	<div id="haveSolar">
		<label><input name="solarYes" value="haveSolarYes" type="radio" bind:group={hasSolarYes} on:click={switchOptions}/>Yes</label>
		<label><input name="solarYes" value="haveSolarNo" type="radio" bind:group={hasSolarNo} on:click={switchOptions}/>No</label>
	</div>
	<!-- Do you have solar: yes 
        - how many panels do you have
        - how much energy do you generate
        - would you like more solar (Yes/No)

        Todo: Hide when 'no' is selected
    -->
    {#if hasSolarYes}
	<div id="haveSolarYes" >
		<div>
			<br><label for="howManyPanels">How many panels do you have?</label>
			<br><input type="number" id="howManyPanels" name="howManyPanels" bind:value={panelsWanted}/>
		</div>
		<div>
			<br><label for="howMuchEnergy">How much energy do you generate?</label>
			<br><input type="number" id="howMuchEnergy" name="howMuchEnergy" bind:value={energyGeneration} />
		</div>
        <div>
            <p>Would you like more solar?</p>
			<label><input name="solarYes" value="haveSolarYes" type="radio" bind:group={wantsSolarYes}/>Yes</label>
            <label><input name="solarYes" value="haveSolarNo" type="radio" bind:group={wantsSolarNo}/>No</label>
		</div>
	</div>
    {/if}

	<!-- Do you have solar: no 
        - Would you like solar (Yes/No)

        Todo: Hide when 'yes' is selected OR when 
    -->
    {#if hasSolarNo}
	<div id="haveSolarNo">
		<div>
            <p>Would you like  solar?</p>
			<label><input name="solarYes" value="haveSolarYes" type="radio" bind:group={wantsSolarYes}/>Yes</label>
            <label><input name="solarYes" value="haveSolarNo" type="radio" bind:group={wantsSolarNo}/>No</label>
		</div>
	</div>
    {/if}
</div>

<style>
</style>

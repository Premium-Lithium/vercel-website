<script lang="ts">

	export let queryParams;

    // Booleans just for showing/hiding options
    let hasSolarYes = false;
    let hasSolarNo = false;
    // Todo put the following variables into allQueryParameters
    let wantsSolarYes;
    let wantsSolarNo;
    let panelsWanted = 0;
    let energyGeneration = 0;

    function hasSolarPanels() {
        hasSolarYes = true;
        hasSolarNo = false;
    }

    function hasntSolarPanels() {
        hasSolarYes = false;
        hasSolarNo = true;
    }

</script>

<div class="container">
	<p>Do you already have Solar?</p>
	<div id="haveSolar">
		<label><input name="haveSolarYes" value="haveSolarYes" type="radio" bind:group={queryParams.hasSolarYes} on:click={hasSolarPanels}/>Yes</label>
		<label><input name="haveSolarNo" value="haveSolarNo" type="radio" bind:group={queryParams.hasSolarNo} on:click={hasntSolarPanels}/>No</label>
	</div>
	<!-- Do you have solar: yes 
        - how many panels do you have
        - how much energy do you generate
        - would you like more solar (Yes/No)
    -->
    {#if hasSolarYes && !hasSolarNo}
	<div id="haveSolarYes" >
		<div>
			<br><label for="howManyPanels">How many panels do you have?</label>
			<br><input type="number" id="howManyPanels" name="howManyPanels" bind:value={queryParams.panelsWanted}/>
		</div>
		<div>
			<br><label for="howMuchEnergy">How much energy do you generate?</label>
			<br><input type="number" id="howMuchEnergy" name="howMuchEnergy" bind:value={queryParams.energyGeneration} />
		</div>
        <div>
            <p>Would you like more solar?</p>
			<label><input name="moreSolarYes" value="moreSolarYes" type="radio" bind:group={queryParams.wantsSolarYes}/>Yes</label>
            <label><input name="moreSolarNo" value="moreSolarNo" type="radio" bind:group={queryParams.wantsSolarNo}/>No</label>
		</div>
	</div>
    {/if}

	<!-- Do you have solar: no 
        - Would you like solar (Yes/No)
    -->
    {#if hasSolarNo && !hasSolarYes}
	<div id="haveSolarNo">
		<div>
            <p>Would you like  solar?</p>
			<label><input name="newSolarYes" value="newSolarYes" type="radio" bind:group={queryParams.wantsSolarYes}/>Yes</label>
            <label><input name="newSolarYes" value="newSolarYes" type="radio" bind:group={queryParams.wantsSolarNo}/>No</label>
		</div>
	</div>
    {/if}
</div>

<style>
    .container {
        margin: .5rem
    }
</style>

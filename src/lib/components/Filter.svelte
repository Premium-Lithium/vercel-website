<script>
    import { slide } from "svelte/transition";
    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import TimerSand from "svelte-material-icons/TimerSand.svelte";
    import FilterVariant from "svelte-material-icons/FilterVariant.svelte";
    import FilterVariantRemove from "svelte-material-icons/FilterVariantRemove.svelte";
    import { currentFilters } from "$lib/installer-portal/sessionStore.js";

    export let open = false;
    const handleClick = () => open = !open;

    const possibleFilters = ["ACCEPTED","REJECTED","PENDING"];
    $currentFilters = [...possibleFilters];
</script>
<div class="container">
    <!-- TODO: add search bar to filtering system -->
    {#if open}
    <div class="filter-container" transition:slide={{axis:'x'}}>
        {#each possibleFilters as filter}  
        <div class="filter">
            <label>
                <input type="checkbox" bind:group={$currentFilters} name="filters" value={filter} checked="checked"/>
                <span class="checkmark"></span>
                <div class="filter-icons">
                    {#if filter === "ACCEPTED"}
                    <Check size="20" color="white"/>
                    {:else if filter === "REJECTED"}
                    <Close size="20" color="white"/>
                    {:else if filter === "PENDING"}
                    <TimerSand size="20" color="white"/>
                    {/if}
                </div>
            </label>
        </div>
        {/each}
    </div>
    {/if}
    <button class="filterButton" on:click={handleClick}>
        {#if open}
        <FilterVariantRemove/>
        {:else}
        <FilterVariant/>
        {/if}
    </button>    
</div>

<style>
/* Filter Styles */
.filterButton {
    border-radius: 10px;
    border: 1px solid #000;
    justify-content: center;
    height: 30px;
    width: 30px;
    margin: 12px;
}
.container {
    display: flex;
    width: 100%;
    justify-content:right;
}

.filter-container {
  max-width: 100%;
  display: flex;
  align-items: center;
  background: #FFF;
  border: 1px solid #cccccc;
  border-radius: 8px;
  justify-content: space-around;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.filter {
  position: relative;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  border: 1px solid #707070;
  margin: 10px;
  display: inline-block;
  background-color: #145f80;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.filter-icons {
  position: relative;
  height: 30px;
  width: 30px;
  align-items: center;
  justify-content: center;
  display: flex;
  
}
.filter input {
  position: absolute;
  height: 0;
  width: 0;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  height: 30px;
  width: 30px;
  top: 0;
  left: 0;
  border-radius: 50%;
  transition: background-color 0.3s ease-in-out;
}

.filter:hover {
  border: 1px solid #000;
}

.filter input:checked ~ .checkmark {
  background-color: #28AAE2;
  border:#000;
}

</style>
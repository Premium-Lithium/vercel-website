<script>
    import { slide } from "svelte/transition";
    import Check from "svelte-material-icons/Check.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import TimerSand from "svelte-material-icons/TimerSand.svelte";
    import { currentFilters } from "$lib/installer-portal/sessionStore.js";

    const possibleFilters = ["ACCEPTED","REJECTED","PENDING"];
    $currentFilters = [...possibleFilters];
</script>

<div class="filter-container">
    {#each possibleFilters as filter}  
    <div class="filter">
      <label>
        <input type="checkbox" bind:group={$currentFilters} name="filters" value={filter} checked="checked"/>
        <span class="checkmark"></span>
        <div class="filter-icons">
          {#if filter === "ACCEPTED"}
            <Check/>
          {:else if filter === "REJECTED"}
            <Close/>
          {:else if filter === "PENDING"}
            <TimerSand/>
          {/if}
        </div>
      </label>
    </div>
    {/each}
  </div>

<style>
/* Filter Styles */

.filter-container {
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filter {
  position: relative;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 1px solid #707070;
  margin: 10px;
  display: inline-block;
  background-color: #1880ad;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.filter-icons {
  position: relative;
  height: 25px;
  width: 25px;
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
  height: 25px;
  width: 25px;
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
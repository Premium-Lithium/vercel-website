<script lang="ts">
    import { slide, fly, scale, fade } from 'svelte/transition';
    import InstallationDate from './InstallationDate.svelte';
    
    export let params;
    let installDate;
    // I don't know why, but this fixes everything
    let vis;
    $: vis = $params.offPeakTariff;

    // this is essential because reactivity is borked
    function updateVis() {
        vis = $params.offPeakTariff;

    }
    
</script>


<div class="refine-body">
    <p>Refine your quote</p>
    <table>
        <tr>
            <td colspan="2">
                <label>Tariff type<br>Single rate
                <label class="switch round"><input type="checkbox" bind:checked={$params.offPeakTariff}  on:change={updateVis}>
                <span class="slider round"></span></label>
            Off-peak</label>
            </td>
        </tr>
        <tr>

            {#if vis === true}
            
                <td in:fly={{x: "30%"}}>
                    <label>Day rate<br>£<input type="number" step=0.01 bind:value={$params.dayTariffRate}> /kWh</label>
                </td>
                <td in:fly={{x: "-30%"}}>
                    <label>Night rate<br>£<input type="number" step=0.01 bind:value={$params.nightTariffRate}> /kWh</label>
                </td>
                
            {:else if vis === false}
            
                <td colspan="2" in:scale={{}}>
                    <label>Tariff rate<br>£<input type="number" step=0.01 bind:value={$params.dayTariffRate}> /kWh</label>
                </td>
            
            {/if}
        </tr>
        <tr>
            <td>
                <label>Solar tariff type<br>FIT
                    <label class="switch round"><input type="checkbox" bind:checked={$params.solarTariffSEG}  on:change={updateVis}>
                    <span class="slider round"></span></label>
                SEG</label>
            </td>
            <td>
                <label>Solar tariff rate<br>
                    £<input type="number" step=0.01 bind:value={$params.solarTariffRate}> /kWh

                </label>
                
            </td>
            </tr>
        <tr>
            <td colspan="2">
                <label for="installdate">Installation month</label>
                    <InstallationDate name="installdate" />
                
                
            </td>
        </tr>
    </table>
    
</div>

<style>
     /* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
} 
    .refine-body {
        width: 100%;
        height: auto;
        text-align: center;
    }

    p, label {
        color: white;
        transition-duration: 0.5s;
    }

    input {
        appearance: textfield;
        min-width: 40%;
        width: 40%;
        border-radius: 0.4em;
        font-size: large;
        text-align: center;
    }
    table, tr, td {
        text-align: center;
        margin: auto;
        transition-duration: 0.5s;
    }

    td {
        width: 50%;
    }

</style>
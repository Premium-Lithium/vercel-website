<script>
    // hide fallback initially
    let fallbackPicker = false;
    let normalPicker = true
    let test = document.createElement('input');
    try {
        test.type = 'month';
    } catch (e) {
        console.log(e.description);
    }

    // if it does, run the code inside the if() {} block
    if(test.type === 'text') {
    // hide the native picker and show the fallback
        normalPicker = false;
        fallbackPicker = true;
    }

    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11, 12]
    let earliestInstall = earliestInstallMonth();
    let installMonth = earliestInstall.month; 
    let installYear = earliestInstall.year;
     export let installationDate;

    function earliestInstallMonth() {
        const now = new Date();
        return {month: now.getMonth() + 1, year: now.getFullYear()};
    }

    function getInstallationDateString(){
        if (installMonth < earliestInstall.month){
            installYear = earliestInstall.year + 1;
        }else{ 
            installYear = earliestInstall.year;
        }
        if (installMonth < 10){
            installationDate = installYear.toString() + '-0' + installMonth.toString();
        }else{
            installationDate = installYear.toString() + '-' + installMonth.toString();
        }
        console.log(installationDate);
    }

</script>

<body>
    <h1> When do you want this installed </h1>
    {#if fallbackPicker === true}
        <label for="month">Installation Month:</label>
        <select bind:value={installMonth} name="month" id="month" on:change={getInstallationDateString}>
         <option value='1'>January</option>
            <option value='2'>February</option>
              <option value='3'>March</option>
              <option value='4'>April</option>
              <option value='5'>May</option>
              <option value='6'>June</option>
              <option value='7'> July</option>
              <option value='8'>August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
        </select>
        <select name="year" id="year" bind:value={installYear} on:change={getInstallationDateString}>
            <option value={earliestInstall.year}>{earliestInstall.year}</option>
            <option value={earliestInstall.year + 1}>{earliestInstall.year + 1}</option>
         </select>
    {:else}
        <label for="date">Installation Date:</label>
        <input type="month" id="date" name="date" bind:value={installationDate} min={earliestInstall.toISOString().slice(0, 7)}>
    {/if}
    </body>
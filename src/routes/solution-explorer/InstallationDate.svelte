<script>
    let earliestInstall = earliestInstallMonth();
     export let installationDate;
     let installationMonths = getIntsallDates();

     function earliestInstallMonth() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
        return nextMonth;
    }

    function getIntsallDates(){
        let months = []
        months[0] = earliestInstall;
        for (let i =1; i < 12; i++) { 
            if (earliestInstall.getMonth() + i < 12){
                months[i] = new Date(earliestInstall.getFullYear(), earliestInstall.getMonth() + i, 2);
            }else{
                months[i] = new Date(earliestInstall.getFullYear() + 1, earliestInstall.getMonth() + i - 12, 2)
            }
        }
        return months;
    }

</script>

<body>
        <select bind:value={installationDate} name="month" id="month">
        {#each installationMonths as month}
            <option value={month}>{month.toISOString().slice(0, 7)}</option>
        {/each}
        </select>
    </body>
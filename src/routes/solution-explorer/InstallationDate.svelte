<script>
    let earliestInstall = earliestInstallMonth();
    export let installationDate;

    function earliestInstallMonth() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
        return nextMonth;
    }
</script>

<body>
    <h2>When Do You Want This Installed?</h2>
    <label for="date">Installation Date:</label>
    <input type="month" id="date" name="date" bind:value={installationDate} min={earliestInstall.toISOString().slice(0, 7)}>
</body>

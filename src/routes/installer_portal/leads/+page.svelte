<script>
    export let data
    const installer_id = 1;
    console.log(data);
</script>

<div>your installer id is: {installer_id}</div>
<div>New Leads:</div>
<ul>
{#each data.jobs as job}
    <li><a href="/installer_portal/leads/{job.Deal[0].id}">Deal id at {job.address}</a></li>
{/each}
</ul>
<div>Accepted Leads:</div>
<ul>
{#each data.jobs as job}
    <li><a href="/installer_portal/leads/{job.Deal[0].id}">Deal id at {job.address}</a></li>
{/each}
</ul>


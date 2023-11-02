<script lang="ts">

    export let sessions = 0;
    export let conversionRate = "0%";
    export let bounced = 0;
    export let bounceRate = "0%";
    export let sessionTime = 0;
    export let consultations = 0;
    export let consultationValue = 0;
    export let surveys = 0;
    export let surveyValue = 0;
    export let preorders = 0;
    export let preOrderRevenue = 0;
    export let express = 0;
    export let expressRevenue = 0;

</script>

<body>
    <table>
        <tr>
            <td>Sessions</td>
            <td>{sessions}</td>
        </tr>
        <tr>
            <td>Conversion rate</td>
            <td>{conversionRate}</td>
        </tr>
        <tr>
            <td>Bounced sessions</td>
            <td>{bounced}</td>
        </tr>
        <tr>
            <td>Bounce rate</td>
            <td>{bounceRate}</td>
        </tr>
        <tr>
            <td>avg non-bounce session time</td>
            <td>{sessionTime}</td>
        </tr>
        <tr>
            <td>Consultations booked</td>
            <td>{consultations}</td>
        </tr>
        <tr>
            <td>Total consultation value</td>
            <td>{consultationValue}</td>
        </tr>
        <tr>
            <td>Surveys booked</td>
            <td>{surveys}</td>
        </tr>
        <tr>
            <td>Total survey value</td>
            <td>{surveyValue}</td>
        </tr>
        <tr>
            <td>Preorder bookings</td>
            <td>{preorders}</td>
        </tr>
        <tr>
            <td>Preorder revenue</td>
            <td>{preOrderRevenue}</td>
        </tr>
        <tr>
            <td>Express bookings</td>
            <td>{express}</td>
        </tr>
        <tr>
            <td>Express revenue</td>
            <td>{expressRevenue}</td>
        </tr>
    </table>
</body>
<style>

</style>
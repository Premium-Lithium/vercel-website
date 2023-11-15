<script lang="ts">


async function sendMail() {
    const emailData = {
            sender: "info@premiumlithium.com",
            recipients: ["andrew.packer@premiumlithium.com"],
            subject: "Test email",
            mail_body: `
                total: 2<br>
                consultations:4<br>
                surveys: 5<br>
                preorders: 67<br>
                express orders: 123<br>
                <br><br>
                the summary json blobs:<br?
                $awsdfaesdf<br><br>
                asdf<br><br>
                All the best,
                Me
            `,
            content_type: "HTML",
        }
        const options = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        }

        const mailAttempt = await fetch("https://vercel-website-liart.vercel.app/send-mail", options)
        if (mailAttempt.status === 200) {
            return {string: "OK"}
        } else {
            console.log(mailAttempt);
        }
        return mailAttempt
}
</script>


<p>Test the email API</p>
<button on:click={sendMail}>Send mail</button>

<style>

</style>
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';

async function populateEmailTemplateWith(data, mjmlTemplateRelPath, importMetaUrl) {
    const response = await fetch(mjmlTemplateRelPath);
    try {
        const mjmlString = response.text();
        console.log(mjmlString)
        const { html } = mjml2html(mjmlString.blob);
        console.log(mjmlString)
        nunjucks.configure({ autoescape: true });
        const renderedEmail = nunjucks.renderString(html, data);

        return renderedEmail;
    } catch (err) {
        const message = "Error processing the email template";
        console.error(message, err);
        return message;
    }
}


export { populateEmailTemplateWith };
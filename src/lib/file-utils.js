import mjml2html from 'mjml';
import nunjucks from 'nunjucks';

async function populateEmailTemplateWith(data, mjmlTemplateRelPath, importMetaUrl) {
    console.log("populating email template");
    const response = await fetch(mjmlTemplateRelPath);
    try {
        const mjmlString = await response.text();
        const { html } = await mjml2html(mjmlString);
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
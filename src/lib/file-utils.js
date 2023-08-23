import fs from 'fs/promises';
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


async function populateEmailTemplateWith(data, mjmlTemplateRelPath, importMetaUrl) {
    const templateFilePath = getRelativeFilePath(mjmlTemplateRelPath, importMetaUrl);

    try {
        const mjmlString = await fs.readFile(templateFilePath, 'utf8');
        const { html } = mjml2html(mjmlString);

        nunjucks.configure({ autoescape: true });
        const renderedEmail = nunjucks.renderString(html, data);

        return renderedEmail;
    } catch (err) {
        const message = "Error processing the email template";
        console.error(message, err);
        return message;
    }
}


function getRelativeFilePath(fileName, importMetaUrl) {
    const __filename = fileURLToPath(importMetaUrl);
    const __dirname = dirname(__filename);

    return join(__dirname, fileName);
}


export { populateEmailTemplateWith };
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';

async function populateEmailTemplateWith(data, mjmlTemplateRelPath, importMetaUrl) {
    try {
        var rawFile = new XMLHttpRequest();
            rawFile.open("GET",mjmlTemplateRelPath,false);
            rawFile.onreadystatechange = function() {
                if(rawFile.readyState === 4) {
                    if(rawFile.status === 200 || rawFile.status === 0)
                    {
                        var mjmlString = rawFile.responseText;
                        console.log(mjmlString);
                        const { html } = mjml2html(mjmlString);
                        console.log(html)
                        nunjucks.configure({ autoescape: true });
                        const renderedEmail = nunjucks.renderString(html, data);
                        return renderedEmail;
                    }
                }
            }
    } catch (err) {
        const message = "Error processing the email template";
        console.error(message, err);
        return message;
    }
}


export { populateEmailTemplateWith };
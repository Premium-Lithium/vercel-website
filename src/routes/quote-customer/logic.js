import pipedrive from 'pipedrive';
import { pd, readCustomDealField, dealFieldsRequest } from '../../lib/pipedrive-utils.js'
import { populateEmailTemplateWith } from '$lib/file-utils.js';
import { supabase } from '$lib/supabase.ts';
import { json } from '@sveltejs/kit';
import { PIPEDRIVE_API_TOKEN } from '$env/static/private';

// todo: only used while we don't have an outlook mail client object
import { getNewAPIToken } from '../send-mail/logic.js';

export default async function quoteCustomer(dealId) {
    let quoteAttempt = {
        "success": true,
        "message": `Quote created for deal ${dealId}`
    };

    const customer = await getCustomerInfo(dealId);

    if(customer === null) {
        quoteAttempt.success = false;
        quoteAttempt.message = `: Could not fetch customer data for deal ${dealId}`;
        console.log(quoteAttempt.message);
        return quoteAttempt;
    }

    let emailData = {
        sender: customer.pl_contact.email,
        recipients: [customer.email],
        subject: "Your Solar PV and BESS Quotes - Options and Next Steps",
        email_body: "error",
        content_type: "text"
    };
    const priceCalcLink = buildPriceCalcLinkFrom(customer.solution, dealId);
    const emailContentData = {
        pl_bdm_contact_name: customer.pl_contact.name,
        price_calculator_link: priceCalcLink,
        customer_name: customer.name.split(" ")[0],
        relative_call_time: "earlier", // todo: if possible calculate this from pipedrive call logs e.g "last week", "this morning", "yesterday"
        schedule_call_link: "https://premiumlithium.com"
    };
    try{
        console.log("getting email template")
        const { data, error } = await supabase
        .storage
        .from('email-template')
        .createSignedUrl('customer-quote-template.mjml', 60)
        if (data){
            const templatePath =data.signedUrl;
            const emailContent = await populateEmailTemplateWith(emailContentData, templatePath, import.meta.url);

            emailData.email_body = emailContent;
            emailData.content_type = "HTML";
            // Create a draft email in the BDM's outlook
            await createDraft(...Object.values(emailData));
            if (!markAsQuoteIssued(dealId)) {
                console.log(`Failed to update deal ${dealId} as QuoteIssued`);
                quoteAttempt = {
                    "success": false,
                    "message": `Failed to update deal ${dealId} as QuoteIssued`
                };
                return quoteAttempt;
            }
        }
            return quoteAttempt;
        } catch (error) {
            console.log("error finding email template");
            // Create a draft email in the BDM's outlook
            await createDraft(...Object.values(emailData));
            return (quoteAttempt = { success: false, message: "error finding email template" });
        }
}


async function getCustomerInfo(dealId) {
    console.log("getting customer info..............")
    const pdApi = new pipedrive.DealsApi(pd)
    const request = await pdApi.getDeal(dealId);

    if(request.success === false) {
        console.log(`Error fetching customer data for deal ${dealId} on pipedrive`);
        return request;
    }
    // This is the complete set of data for the deal provided by Pipedrive's API
    const customerData = request.data;
    // We want to strip this down to only the data we care about when sending a quote email
    const customer = {
        name: customerData.person_name,
        email: extractEmailFrom(customerData),
        solution: extractSolutionFrom(customerData),
        pl_contact: extractPLContactFrom(customerData)
    }

    return customer;
}


function extractEmailFrom(customerData) {
    console.log("extracting email...........................")
    const emails = customerData.person_id.email;

    // Try to find a home email first
    const homeEmail = emails.find(email => email.label === 'home');
    if(homeEmail !== undefined){
        return homeEmail.value;
    }
    // Fall back to work email if home email isn't found
    console.log("No home email found, searching for work email...");
    const workEmail = emails.find(email => email.label === 'w ork');
    if(workEmail !== undefined){
        return workEmail.value;
    }
    // Use any other email that's added, if there is one
    console.log("No work email found, searching for any other email...");
    if(emails.length > 0 && emails[0].value !== '') {
        const firstEmail = emails[0].value;
        console.log(`Using ${firstEmail}...`);
        return firstEmail;
    }

    console.log(`Could not find any email address for ${customerData.person_name}.`);
    return json({status: 500, message: "could not find email"});
}


function extractSolutionFrom(customerData) {
    console.log("extract solution...........")
    try{
        const solution = {
            batterySize_kWh: parseInt(readCustomDealField("New Battery size (kWh)", customerData)),
            evCharger: {
                included: readCustomDealField("EV Charger?", customerData) == "Yes",
                type: "todo: some charger type"
            },
            // todo: Build a complete description of the solution Premium Lithium will provide
        };
        return solution;
    }catch(error){ //default solution for if a deal doesnt have one 
        const solution = {
            batterySize_kWh: 15,
            evCharger: { included: true, type: 'todo: some charger type' }
          }
        return solution;
    }
}


function extractPLContactFrom(customerData) {
    console.log("pl contact..........................")
    // todo: Could there ever be a case where the deal isn't actually linked to someone from premium lithium?
    const bdm = customerData.user_id;
    const plContactPerson = {
        name: bdm.name.split(" ")[0],
        email: bdm.email,
    };

    return plContactPerson;
}


function buildPriceCalcLinkFrom(solution, dealId) {
    console.log("byuilding price calc link ...............")
    const params = {
        batterySize_kWh: solution.batterySize_kWh.toString(),
        evCharger: solution.evCharger.included ? "1" : "0",
        dealId: dealId
    };

    const searchParams = new URLSearchParams(params);

    const priceCalculatorURL = "https://vercel-website-liart.vercel.app/price-calculator";
    const priceCalcLink = priceCalculatorURL + '?' + searchParams.toString();

    return priceCalcLink;
}


async function createDraft(sender, recipients, subject, mail_body, content_type) {
    try {
        console.log("creating draft...................................")
        const apiToken = await getNewAPIToken();
        if (apiToken === null) {
            console.log("error creating API token");
            return json({status: 500}, {statusText: "error creating api token"});
        }
        // const attachments = getAttachments();
        const messagePayload = {
            subject: subject,
            body: {
                contentType: content_type,
                content: mail_body,
            },
            toRecipients: recipients.map(email => ({ emailAddress: { address: email } })),
            bccRecipients: [
                {
                    emailAddress: {
                        address: "development@premiumlithium.com",
                    }
                }
            ],
            attachments: [
                {
                    '@odata.type': "#microsoft.graph.fileAttachment",
                    "name": "attachment.pdf",
        "contentType": "application/pdf",
        "contentBytes": "JVBERi0xLjYKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCXKvQrCQBAE4H6fYmoh6+4ll9uDY8GIFnaBAwux86cTTOPrm1OmmI9hhBUfekMgLMEQc+SQImxQtlGx3Om8wev/WLM8aaoURzak1HO2jHrD9qjQgPq4FFEPRYL0rkWG5uhdKjI2pjaaZO/W3nksMv1osvdrPdGh0kwzvjTjH9EKZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iagoxMjkKZW5kb2JqCgo1IDAgb2JqCjw8L0xlbmd0aCA2IDAgUi9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoMSAxMDE2ND4+CnN0cmVhbQp4nOU5bXBb1ZX3vKcvW3L0EduxrMh68ouTGFmWE8UhhiR+sS3ZiZ1YseMgBYglW7IlsCVFkh0Cy+K2BDJOUwJlKVCmpB1gUzZTnknaDV22MVNot8OWj112dyhNyUzTYbolJWVTloVa3nOvnhwnDTC7s//2ye/d833OPefc+67kXGYiRgxkivBEGh6PpGutlRZCyD8SApbhyZywqbfiRoTPEcL900h6dPzxv73lEiGqU4RoT42OHRhpfs8aJsQQJ0R/SzwWibY2PegmZNnLaGN9HAn9+QNaxP+E+Ir4eO6OM6oBLyFVAuLrxlLDkanyl02I70J8+XjkjvR1qjYO8TTiQjIyHvv4Wz+OIn4U7WfTqWwuSg7NoykV5aczsXTP40OvIL6CEB5lCOCHXgYENRTneJVao9WVlOoN5P/jpT5CKkiXehMxkjR7XnHxJ4iVPEbI/PsUu/zM98x/8n8Zha4wPEqeIafIEfI2uVVh+EmAJMgEUhZfL5E3kUqvANlDniXTn2H2BDmN/IJcmDxAZ3LNK0C+QU6Sn17hJUDGyV0Yy/fJ27CG/AxbJUU+BB35EnkFrX6ItO3XMsUtwccIA0cWUd8h3+QOk23ceUQeoxzOw5nIy+QJ2IuWczjPIwsz3vhnRu8nd+Ozn8TJJMLsUm/60y9Iyfx/4KzuJtvIl8kWMrZI40V4ki/F+u0iT2JOX2I0T5Gp7eJv437AcXNfR+RBMop3BHDu3BF+y2dk6H988QOkDOr5OlJyLS63jhjzn3Br5y/xK0gpGZi/WKTNd8//Bx/JJ1WDquXqTapXP8+H5kHVOGqT+d/k78pH1TvUz2C1jhMidd68JxQc2NXftzPQu2N7T/e2rV2dfl9He9sWqXXzpo033tCy4fr1zWuaPI3uhtWrVtatEGudjqpys8m4pExfWqLTatQqngPSIMgQ9sl8nWD2R0SfGOlyNwi+qniHu8En+sOyEBFkHFQrxa4uRhIjshAW5JU4RBaRw7KEkiNXSUoFSWlBEkzCRrKRuhAF+ecdonAa9uwMInykQwwJ8gUGb2ewaiVDyhBxOlGDRUWjFXyyfzI+7QtjjDCjL20X22Ol7gYyU6pHUI+QvFpMz8DqzcAAbrXvhhmO6MqoW5ypLxKVAzuDvg6b0xlyN2yVl4gdjEXamUlZ0y5rmUkhQUMnh4WZhtnpr542kaGwyxAVo5FbgjIfQd1p3jc9fb9sdsn1Yodcf+f5Kpx5TG4QO3yyi1rt7lvw033ZJcjqOpMoTP+R4HTEC+9fSYkoFE2d6Y+EgjLXLkNf0Ekvmx9zPT3tFwX/dHg6cnp+akgUTOL0jMEwnfZhukkgiCZOz//wsE32fzUkm8JxuCGkTN3f1y0v3XlzUObq/EI8ghT8axWdG2xO84JM4LPYBNOCycEMO500DYdPS2QIEXlqZ7CAC2TI9jyRPK6QzIUpZ7bIqRignKkiZ0E9LGJtu/uD07KqbmtU9GHGD0fkqSHsrttoYUSTvOQjm1OctpiFFk+IyQoY1dZoQpDVKzFJqLVYAfuGqkybGLLko8JwwYYOVpotQouIZqgdn+gLK3+T8So0IGCiu1yFRtgVlKUOBKSIUjHfTJMHNSJhLFiigxVT9ohpuVxsW6guDcuX6A8yFUVNLm+XSXhY0ZI9PrauBN90uKMQArUl7gy+QLzz52bWCbaTXrKOhDqocGU7dtlK33QwOiI7wrYorrsRIWhzylIIKxwSg7EQbTvMUP05G2uOEOuVXcHufrF7557gBiWQAoOaU9X5rjIjBm0FM9iAsq5OJwQ5Gx9CQRMSBD8CYttGfMraOh3eJkw4o9LGbdsoBMFGitIYhlwv+GIdihzFrzCqpu3U3lW0pqEo2mnvsjlDzsLlbuCQLSiOUUNHk9pVZOE2hQwd9md7FyPRXFbRpheCYkwMiXFBlgJBOjeaHpZlJRks50qtdl2BLUoWpok4kV1EaDJlv8u2OLlyJ8MX0K6r2FuLbGFaJ3b3T1PjomKQYORbZUJbWNpgtrG9gC5oEfdewYRLmi3o6RlJoos5fgM1Im6NTov9wY1MGveTu213Ul8W0g3du9rcDbi1tc2IcGjnjASH+vcEXzDhufDQruDzHHDt4bbQzArkBV8Q8KXBqBylUiJFBIpQS32I6Ji87QWJkCnGVTECw4dPA2E0XZEGZPg0V6CZCo5WMkcS4ZCjKnCkorQKaboCbYrR2DVDaMqkUrWkk0okA1fG2WaAkp5Hyg/xHFsC5KQBysA2g1p9jHwapmZKJFtBYgolpEKEhwYuux7YEzxpwLezjT3RURu9sF2q4lhsfK34hChtlL8IxafDIbrYSCWWBv9ABnEzlkncjIFoDHKpGGuT9WIbpbdSemuBrqF0LbYoVAKqT2HtAzLQDrg56MQlKVT/zDZtukArFcJNZdr0GzdmDL9HqO7GM6iNJCW/obwcrBojqJbbDUvDoUFDysC5DcATg8nAlagNBpXNVh4O2WAwZLOo9OGQihsMqfhzdjhmh7QdAnaQ7HArvUiry0Wq8GG2kJYqz+DeWwdvvRURWNZi9pq9a5pawbyq2WkWV610gdl5vRchp9kptIKXd9544gT/+zYh/dY7cJtDkhz5R0AHXKClbemnbzbbVN+qbs6feXvJ3KVj+eh35s6aPs5/i9BvGfgdiX8PT8828pYU0+gtZQZ19dJyKwZtreCXqs1aPGcst9ulSLRLZS+3cyvs6+wd9qj9XvtT9pftb9nP20sofQUSKekUEs/bL9lLW1RIo2IPI1WzgklThtp+en72pN3ZRUfpOuOyLpw9R+xNdq6Et5ZbyoxlgZDaUL1UVVJpNNo0Kn2JPhDiSipIq9dlJl6vt6rVa1nWUoCB5cjl2pfZe+u+DKaqkKniZ01TXYWz+Xo9LKNDCWDyKrS2wlAC/Hv53Xe/nf9S/nvj0Jy/mIJn7/7+G1+CvrH8x9DsdruXwfb8TIXbbYJH4UGr223LfwgmHCvyz+Yb8RhIuubf5/fxL2Hu6si41GrW1dWpBIPBquLxqFZbWrszVFVhNi8PhIxmh5kz8GYz0ZVWalWBkLaCVARCxDS1CgZXgbQKEMAJZLADaAMQOscW2gCsFehcF7rA7MVpwdrKCjNOapVGrDWv2wyt0LxupVhrBLF5PWiXQEW5d+366+HNxx+cyOeXZmb+sPXYo0c6t0X7azd8B8hX7ht8oGN4Lf/SX3557qDVvTcDVXvv2sKrvh65xTPxczFfo1LvTcqOKtofLjy9WvlXyBp4Xpo3GzTLlzvJ6tVut9PAe9euaQyE1hhXO5ebDW6XOxByGF0VVo2mpKS8L1RiWoWtxdf1hXjTpBd2e2G9F1Z4odILGi985IXzXnjLCz/xwlNeeMQLQ16AgBc6vNDE5Mq9oPJC/GJR8JQXcl6QvLCOsZF3yQvveGHWCzKzca8Xol7FREHGVBR7wwsve+FvvHCUid3uhRu9IBR9bCg4OOaFsBd2FX2UM83zTPNhL0yhe8m1iG9juudZAJzMBNLMPXo1ekG3ly1puoL3Xb4yyqUw2bVv3zUEMpfVFwlhe9BWwCVQHL3KovAy2uUeKXQ/bAbv2spl9GktrAHzOrF2CactdA9FsWu0CozLAvzdxyXfhH376x0XD+QHvnqs2udrrTAfybcdHhgIfuVIfvf+/bCUD7tuWNfiasv/bu4RXA9WLnhCV1qmWr+liPaH7HNWCvKC1c2+RhFnvoeXsY+WESc5KO2sMaoslmVVpctKa8VllnJLIFRuKxMCobJKu01r2xlSaU08CYR4oyTClAhEhJYmEc6JMMvwsAjSIrhVhIUk0cwp64jlprCclCXUUlxCmJylOF+WmsqKck6sXVVpL6QICjmp9K599HbQcdcd2XrqlX97dd+I5qm8tJ+L3n3PxI7QbX/iR6zu61c0fPLvH+Q/qeyqz1d5PFX8jtm/c87hKsd1U4+TNqmP4LfK70hpNX5X0wRC+A1TzatxVhVv6eFlPZzSw1N6eFgP9+ohp4eoHlbooVwPKj20XGISR/XApfUQ1kNAD5IeZvUg6+EYQ016IHq4yFCUWyx2RdPQbhq8qucKjVRomRbcJS83QOrbeeuxY+D30/KpuSo31i6A+5wfa1dBlpMj0h4rgLFaV2GssNdYsUZGq8OKm5vVarBYKgMhi8mg3hkyVM7WgFwDx2rgaA1M1UC6BsI1EKgBUgObcZBqoKkGhBow1cBFJodCxQWwd3GgrHrFF6JLKWKxwSvKa4BudRVLQKxdaV633iuYK6BWU+FctxJUm+4ZXf9wU9PTu9959bUzkMh/I56Ch26Bty3TjwUs+g2OxvdB/dGH+ZE+eOL4Uycfo31K3+1OfLfrSBWZlaZIhbq01FhhrLaWaMKhkpIyi4UP4xwHQxa+1FhmHAyVWR6ohnuqIVUNnmpMDLxbDWeq4UlG6a2GVkafZ/TXGXGQiW0oyJ1hygXN55jaPUzHwSjFXaRQx72Ly1rI1EIhlRS5FjU5pmcdPShgftSXl7hgLteI/J7HfzAU/+638zv+Ze7VJ0/AJ/D+f/2Wl5/+2tzBxy/l22zNyolh4rV/pTmZ/5N6AnNSgqu3R/Koy0lZeVmVdVnFYGiZKhxaxpvKB0MmbThkshArtEpWEKxwzgrHrJC20maki3LR4UaJEOMzEadIV5oFBGJGpE5kQaqeyr+Zf+/UHU9/9Nu5jyELI/m/zn83X3vixAnuOFih9tO7dFDLv5L/fv5UXs4/oypEy84ztH71GOsyckl6ptJiKTcDaDTlet5aZSZ4PDOnzJzbjMczs8mMxzOzGd9WJqysdjBUwoNGpcHDmeWUFZ6ywsNWmLJCzgpRK6iscNEK563wFqMjMWyFXVbosMIbVnjZCgsq9xZVkIuZaGLJKGcWWi4xEwU5xGet+Oawwr7Bq7v+iveC8kK4utJXnw6VjF4u9BXHRDj+7txLTy6cEA87Nm1ycHvmPlqoND0bvknPhpjDU/jiPqjuIqWkW3JriVqtNxCtSSto+RJeK5Vq6C6WDfFVkgGIAc4Z4JgBwgZAtBB3MdTqn2OQtNzszFKnxsjqzOrmOi+XBcucB5bm/wD3rwuwGPyR5l8R9ps3Z33s2bff2TJo3PhH4ij83voPHW+8dvnXtHyPxqqmv0LqsDcLF+ppnXkfuWlBCK76Ca5M04Kd8Wtyo4oQC3+EdCHuQtjJtZB6xAPUlCpLblT/FGWyTO4U0xwBFUxyj/MW/g7+9/zvVXeoXlOn1d9jHsrIWiUGjpiIh9yCwI/5nxCecWsguRDH7oWYACV3KzBHtGREgXk8R44rsAplDimwGr08qsAaYiRPK7CW3IkRFmAdKYdGBS4hS6BNgUshCQEF1pPl3I8W/qvQyP1CgctIM69T4CWkmt9Eo1fRX0NP8DcpMBBBxSswR5aoRAXmyXrVGgVWocyoAqtJtep+BdaQGtW3FVhLLqnOKLCOrFafVOASslz9jgKXcr9U/6cC68kG3T8rsIHcUqJX4DJyW0nR1xKyruTNjsRoIpe4MxYVopFcRBhOpQ9kEqPxnLB6uF5Y27SmSehMpUbHYkJ7KpNOZSK5RCrZWNp+tdhaoQ9NdEVyDcLW5HBjT2IoVpAV+mOZxEhfbHRiLJLZkh2OJaOxjOAWrpa4Gt8dy2QpsrZxTWPzZebVsomsEBFymUg0Nh7J3C6kRq6MQ8jERhPZXCyDxERSGGjsbxQCkVwsmRMiyaiwa0Gxd2QkMRxjxOFYJhdB4VQujpHeNpFJZKOJYeot27gwgUXZ6M/FJmPC9kguF8umkm2RLPrCyHYlkqlsg7A/nhiOC/sjWSEayyZGk8gcOiBcqSMgN4JzSSZTk2hyMtaAcY9kYtl4IjkqZOmUFW0hF4/k6KTHY7lMYjgyNnYASzaeRq0hrNH+RC6OjsdjWWFHbL/QlxqPJJ9tLISCuRnBnAqJ8XQmNclidGeHM7FYEp1FopGhxFgih9bikUxkGDOGaUsMZ1lGMBFCOpJ0+yYyqXQMI72ps+eyIAZYyGY2NTaJnql0MhaLUo8Y9mRsDJXQ8VgqdTudz0gqg4FGc3H3oshHUskcqqaESDSKE8dspYYnxmmdMM25YnCR4UwKeemxSA6tjGcb47lc+gaPZ//+/Y0RpTTDWJlGtOz5PF7uQDqm1CNDrYyP9WD5k7R0E6y+dBL9W3uE3jTmx4/BCYpAg1DszDWNaxQXmMZEOpdtzCbGGlOZUU+vv4d0kAQZxTuH950kRqJEwDuCeAShYZIiaXKAZJhUHKkCWY3UehzXkiayBm+BdKJUCvljqC+QdoQzqEWfEWY3RZKkEV827V9obS1CfUoUXUy7AaGtqD+MFnpQbwi5i+0KpJ9RErjNUs1RMoFxRJCyhWRRK4YyUSYhEDfeX2Tji/i7GZRd4KzFuNbg3XxNzS+ym0BLAst0jnFopOMs+tuRlkK9z8uHgHIxVr0scmIMizKr1PYASvQzqQDTpJnIMW9JJrXrGh570eMI6g+zShYlh5lt2hEFyymE40pOb8N8Z1gEUaZXnFsWPf95Ba7dG/0suknmczujUzzLeG2IZ5V5FXK2i0WRQirNxX6MhPqNMzjC8hll2rTHkormEHad8Ll+BEU3otQlyXxMKlFSnQYl3yPsmWV+k+hDYPEVqnylb4HlKcKyXqj0OHJzTHYY6WP4OaCssnHMSsHXkLKO9rNVGVdmPM7sCmQHjvtZV6RY3ZLOWlbjy1kp9M2I0qcC000jnGKzKObRzWpDZxJjkVIowlb+EGqMMd+F2OKsOyKstjGl1jk2g2K+ospMadRpRnETH+sLut5jSk5vwn2i55oWCxlc3Ju0JmMs3uwi20kWbXRhjoVsU6kxxVNhxmNsP7p9oT4jrN8KGY0ya+7PyPkIy01O8ZpiEUXxU6h4obdSqDvB6lFYT4Vuzv1Z5iIsvylFL812pZwSyzhbH3HWgWlyAx4sPRgd/TSyPly8aoaVNdOoxOz5X+vRuNIsg4vXR2YhlnGMsUdZ/cmFVTexaP0WK9GPe1AP2y/SSv/4lcwJV1mgq+bqPXMN2zOvnEWhGxOI51g8WZbLRjaHUeT3ooceeoZm1/xBDOka10xJYMsQxAhAHEbJUuKAMNkBg2QAtpBNIOEoIa8Nx3bE6dgIm8gUym1C+mbENyL9Rtw7HfhsxbsX7wfwVuFdkGhCCQ+OHgV3I96AGq/jE9hNqa1IpeM2xLtw7FRGP9J9OPoUfCviOJIwaPEQ3sqeZ0AlnYRzc/D6HAhzcM+nEPgUpj48+iH3h4v1jucunrnI9X4w+MFzH/BNH4DxA9CRC6YLgQvhC+kLxy5oSo3vg4H8Dsy/PrfB8e6mswO/2vTLAXIWZ3a26Wzg7NRZ+az6LPADv+QrHaZZYbZpNj07NfvG7LnZi7O6qR8d/RH39y96HMYXHS9yjpO9J+85yYePg/G44zgX+Gb4m9zRJ8D4hOMJzxP84481Oh7rrHF845FVjnOPXHyEoz/8P1Jm9r8IvdBDNmEOd5zk5x3PbamA7TgtIz4deHvw7sU7hfcDeON3HhR34O2BHmkDP/hXoH/I9pDrobseOvyQOn3f1H1H7+OnDh49yD03eWaSywbqHamky5HsvM5h9VYNaL38gAbd0H83bB2qW+0PD0qOQRS6eU+TY09nvWOp1zKgxgmrUNDIO/hWvpdP8Q/wZ3itri9Q49iJ97nAxQAnBUoMfmOvo9fTy5+ePyfFup1obVt629Q2fqu/3tHVucFh7HR0ejpf73y384NOzWAnPIl//uf8Z/y85K/3+CV/jdO/vMs2UOmtGDCDccDkNQ5wgIX2kgGPcd7IGY2DxnuMvJG0Em6qEtRwGo7O7Op3ubpPa+f7umVd4GYZDsl1/fQp7dwjaw7JZGDPzcEZgK+FDh45Qtrs3fLa/qActoe65SgCEgWmEDDZZypJWyibzbnYBS4XwhP4JK4JFxL3ZgtUssAnrixkcYvKMiVwUYECDvh0UR4SqB6g9t4soQ/KdBWUqHZWMceUCw8GVO39b+3R72AKZW5kc3RyZWFtCmVuZG9iagoKNiAwIG9iago2MDAzCmVuZG9iagoKNyAwIG9iago8PC9UeXBlL0ZvbnREZXNjcmlwdG9yL0ZvbnROYW1lL0JBQUFBQStMaWJlcmF0aW9uU2VyaWYKL0ZsYWdzIDQKL0ZvbnRCQm94Wy01NDMgLTMwMyAxMjc3IDk4MV0vSXRhbGljQW5nbGUgMAovQXNjZW50IDAKL0Rlc2NlbnQgMAovQ2FwSGVpZ2h0IDk4MQovU3RlbVYgODAKL0ZvbnRGaWxlMiA1IDAgUgo+PgplbmRvYmoKCjggMCBvYmoKPDwvTGVuZ3RoIDI3OS9GaWx0ZXIvRmxhdGVEZWNvZGU+PgpzdHJlYW0KeJxdkc1uhCAUhfc8BcvpYgI66kwTYzJ1MomL/qR2HkDhakkqEsSFb1+4TNukC8l3uefA9cDq5tJo5dibnUULjg5KSwvLvFoBtIdRaZKkVCrh7hWuYuoMYd7bbouDqdHDXJaEvfve4uxGd2c59/BA2KuVYJUe6e5Wt75uV2O+YALtKCdVRSUM/pznzrx0EzB07Rvp28pte2/5E3xsBmiKdRJHEbOExXQCbKdHICXnFS2v14qAlv96/hfQ0g/is7Nemngp51leeU6Rj6fAB+QiCZxFvgTOo4YHLuJ+HfgYGc85IaeoeUTOkc/xrizwU+QicI18SHDg+2Rh9JDtTyRUrNb6OPABMIeQgNLw+0ZmNsGF3zf1jocyCmVuZHN0cmVhbQplbmRvYmoKCjkgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvQmFzZUZvbnQvQkFBQUFBK0xpYmVyYXRpb25TZXJpZgovRmlyc3RDaGFyIDAKL0xhc3RDaGFyIDEyCi9XaWR0aHNbNzc3IDYxMCA1MDAgNDQzIDc3NyA1MDAgMjc3IDQ0MyAyNTAgNTU2IDcyMiA1NTYgNTAwIF0KL0ZvbnREZXNjcmlwdG9yIDcgMCBSCi9Ub1VuaWNvZGUgOCAwIFIKPj4KZW5kb2JqCgoxMCAwIG9iago8PC9GMSA5IDAgUgo+PgplbmRvYmoKCjExIDAgb2JqCjw8L0ZvbnQgMTAgMCBSCi9Qcm9jU2V0Wy9QREYvVGV4dF0KPj4KZW5kb2JqCgoxIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgNCAwIFIvUmVzb3VyY2VzIDExIDAgUi9NZWRpYUJveFswIDAgNTk1LjMwMzkzNzAwNzg3NCA4NDEuODg5NzYzNzc5NTI4XS9Hcm91cDw8L1MvVHJhbnNwYXJlbmN5L0NTL0RldmljZVJHQi9JIHRydWU+Pi9Db250ZW50cyAyIDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2VzCi9SZXNvdXJjZXMgMTEgMCBSCi9NZWRpYUJveFsgMCAwIDU5NS4zMDM5MzcwMDc4NzQgODQxLjg4OTc2Mzc3OTUyOCBdCi9LaWRzWyAxIDAgUiBdCi9Db3VudCAxPj4KZW5kb2JqCgoxMiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFIKL09wZW5BY3Rpb25bMSAwIFIgL1hZWiBudWxsIG51bGwgMF0KL0xhbmcoZW4tR0IpCj4+CmVuZG9iagoKMTMgMCBvYmoKPDwvQ3JlYXRvcjxGRUZGMDA1NzAwNzIwMDY5MDA3NDAwNjUwMDcyPgovUHJvZHVjZXI8RkVGRjAwNEMwMDY5MDA2MjAwNzIwMDY1MDA0RjAwNjYwMDY2MDA2OTAwNjMwMDY1MDAyMDAwMzcwMDJFMDAzMz4KL0NyZWF0aW9uRGF0ZShEOjIwMjMwOTE1MTAxMTEzKzAxJzAwJyk+PgplbmRvYmoKCnhyZWYKMCAxNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDcxODEgMDAwMDAgbiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCjAwMDAwMDczNTAgMDAwMDAgbiAKMDAwMDAwMDIzOSAwMDAwMCBuIAowMDAwMDA2MzI3IDAwMDAwIG4gCjAwMDAwMDYzNDggMDAwMDAgbiAKMDAwMDAwNjUzOCAwMDAwMCBuIAowMDAwMDA2ODg2IDAwMDAwIG4gCjAwMDAwMDcwOTQgMDAwMDAgbiAKMDAwMDAwNzEyNiAwMDAwMCBuIAowMDAwMDA3NDc1IDAwMDAwIG4gCjAwMDAwMDc1NzIgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDE0L1Jvb3QgMTIgMCBSCi9JbmZvIDEzIDAgUgovSUQgWyA8NzZEN0MyRkIxQzFCRTFEQUM1MzlGMzBGNzJGRDE1QzI+Cjw3NkQ3QzJGQjFDMUJFMURBQzUzOUYzMEY3MkZEMTVDMj4gXQovRG9jQ2hlY2tzdW0gL0JGMzg4RDhBQTY3OTBCRTRCQUEwNThGOUU3RTFBRjQ2Cj4+CnN0YXJ0eHJlZgo3NzQ3CiUlRU9GCg=="
                }
            ]
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiToken,
        };

        const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(messagePayload),
        };

        const apiUrl = `/v1.0/users/${sender}/messages`;

        const response = await fetch(`https://graph.microsoft.com${apiUrl}`, options);
        if (response.status !== 201) {
            console.log(`Error: Microsoft Graph API request failed with status ${response.status} ${response.statusText}`);
            // Handle the error here or throw it to be caught by the caller.
            throw new Error(`Microsoft Graph API request failed with status ${response.status} ${response.statusText}`);
        }else{
            const responseBody = await response.json()
            if (responseBody){
                console.log(responseBody)
                // need sepparate request for sending attachment
            // const attachment = {
            //         '@odata.type': "#microsoft.graph.fileAttachment",
            //         name: "pdf1",
            //         contentBytes: "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ZS9QYXJlbnQgNCAwIFIvUmVzb3VyY2VzIDExIDAgUi9NZWRpYUJveFswIDAgNTk1LjMwMzkzNzAwNzg3NCA4NDEuODg5NzYzNzc5NTI4XS9Hcm91cDw8L1MvVHJhbnNwYXJlbmN5L0NTL0RldmljZVJHQi9JIHRydWU+Pi9Db250ZW50cyAyIDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2VzCi9SZXNvdXJjZXMgMTEgMCBSCi9NZWRpYUJveFsgMCAwIDU5NS4zMDM5MzcwMDc4NzQgODQxLjg4OTc2Mzc3OTUyOCBdCi9LaWRzWyAxIDAgUiBdCi9Db3VudCAxPj4KZW5kb2JqCgoxMiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFIKL09wZW5BY3Rpb25bMSAwIFIgL1hZWiBudWxsIG51bGwgMF0KL0xhbmcoZW4tR0IpCj4+CmVuZG9iagoKMTMgMCBvYmoKPDwvQ3JlYXRvcjxGRUZGMDA1NzAwNzIwMDY5MDA3NDAwNjUwMDcyPgovUHJvZHVjZXI8RkVGRjAwNEMwMDY5MDA2MjAwNzIwMDY1MDA0RjAwNjYwMDY2MDA2OTAwNjMwMDY1MDAyMDAwMzcwMDJFMDAzMz4KL0NyZWF0aW9uRGF0ZShEOjIwMjMwOTE1MTAxMTEzKzAxJzAwJyk+PgplbmRvYmoKCnhyZWYKMCAxNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDcxODEgMDAwMDAgbiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCjAwMDAwMDczNTAgMDAwMDAgbiAKMDAwMDAwMDIzOSAwMDAwMCBuIAowMDAwMDA2MzI3IDAwMDAwIG4gCjAwMDAwMDYzNDggMDAwMDAgbiAKMDAwMDAwNjUzOCAwMDAwMCBuIAowMDAwMDA2ODg2IDAwMDAwIG4gCjAwMDAwMDcwOTQgMDAwMDAgbiAKMDAwMDAwNzEyNiAwMDAwMCBuIAowMDAwMDA3NDc1IDAwMDAwIG4gCjAwMDAwMDc1NzIgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDE0L1Jvb3QgMTIgMCBSCi9JbmZvIDEzIDAgUgovSUQgWyA8NzZEN0MyRkIxQzFCRTFEQUM1MzlGMzBGNzJGRDE1QzI+Cjw3NkQ3QzJGQjFDMUJFMURBQzUzOUYzMEY3MkZEMTVDMj4gXQovRG9jQ2hlY2tzdW0gL0JGMzg4RDhBQTY3OTBCRTRCQUEwNThGOUU3RTFBRjQ2Cj4+CnN0YXJ0eHJlZgo3NzQ3CiUlRU9GCg=",
            // }
            // const attachOptions = {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': 'Bearer ' + apiToken,
            //         'contentType': "application/pdf",
            //     },
            //     body: JSON.stringify(attachment)
            // };
            // const attachUrl = `/v1.0/users/${sender}/messages/${responseBody.id}/attachments`
            // const attachResponse = await fetch(`https://graph.microsoft.com${attachUrl}`, attachOptions);
            // if (attachResponse.status !== 201){
            //     console.log("failed to add attachment", attachResponse.status, attachResponse.statusText)
            // }else{
            //     console.log("added attachment");
            // }
        }
    }
        return response;
    } catch (error) {
        console.log(`Error: Failed to create draft: ${error}`);
        // Handle the error here or throw it to be caught by the caller.
        return json({status: 500},{statusText: "failed to create draft"});
    }
}

async function getAttachments(){
    //using the solution get the datasheets for products the customer is interested in
    // (datasheets stored in bucket on supabase)
    console.log("getting email attachments")
        const { data, error } = await supabase
        .storage
        .from('email-template')
        .createSignedUrl('/attachments/pdf1.pdf', 100)
    console.log(data, error)
    if (error != null ){
        console.log("error geting attachment");
        return null;
    }
    let attachments = {
        name: "pdf1.pdf", // from supabase
        // contentBytes: toBase64.getDecoder().decode("JVBERi0xLjYKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCXKvQrCQBAE4H6fYmoh6+4ll9uDY8GIFnaBAwux86cTTOPrm1OmmI9hhBUfekMgLMEQc+SQImxQtlGx3Om8wev/WLM8aaoURzak1HO2jHrD9qjQgPq4FFEPRYL0rkWG5uhdKjI2pjaaZO/W3nksMv1osvdrPdGh0kwzvjTjH9EKZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iagoxMjkKZW5kb2JqCgo1IDAgb2JqCjw8L0xlbmd0aCA2IDAgUi9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoMSAxMDE2ND4+CnN0cmVhbQp4nOU5bXBb1ZX3vKcvW3L0EduxrMh68ouTGFmWE8UhhiR+sS3ZiZ1YseMgBYglW7IlsCVFkh0Cy+K2BDJOUwJlKVCmpB1gUzZTnknaDV22MVNot8OWj112dyhNyUzTYbolJWVTloVa3nOvnhwnDTC7s//2ye/d833OPefc+67kXGYiRgxkivBEGh6PpGutlRZCyD8SApbhyZywqbfiRoTPEcL900h6dPzxv73lEiGqU4RoT42OHRhpfs8aJsQQJ0R/SzwWibY2PegmZNnLaGN9HAn9+QNaxP+E+Ir4eO6OM6oBLyFVAuLrxlLDkanyl02I70J8+XjkjvR1qjYO8TTiQjIyHvv4Wz+OIn4U7WfTqWwuSg7NoykV5aczsXTP40OvIL6CEB5lCOCHXgYENRTneJVao9WVlOoN5P/jpT5CKkiXehMxkjR7XnHxJ4iVPEbI/PsUu/zM98x/8n8Zha4wPEqeIafIEfI2uVVh+EmAJMgEUhZfL5E3kUqvANlDniXTn2H2BDmN/IJcmDxAZ3LNK0C+QU6Sn17hJUDGyV0Yy/fJ27CG/AxbJUU+BB35EnkFrX6ItO3XMsUtwccIA0cWUd8h3+QOk23ceUQeoxzOw5nIy+QJ2IuWczjPIwsz3vhnRu8nd+Ozn8TJJMLsUm/60y9Iyfx/4KzuJtvIl8kWMrZI40V4ki/F+u0iT2JOX2I0T5Gp7eJv437AcXNfR+RBMop3BHDu3BF+y2dk6H988QOkDOr5OlJyLS63jhjzn3Br5y/xK0gpGZi/WKTNd8//Bx/JJ1WDquXqTapXP8+H5kHVOGqT+d/k78pH1TvUz2C1jhMidd68JxQc2NXftzPQu2N7T",
        contentType: "application/pdf",
    } // encoded base 64 file
    // let contentBytes = btoa(data.signedUrl);
    // attachments.name = "example attachment"
    // attachments.contentBytes = contentBytes;
    return attachments
}

async function markAsQuoteIssued(dealId) {
    console.log("marking quote as issued ")
    // Update the `Quote Issued` field on pipedrive with todays date
    const dealsApi = new pipedrive.DealsApi(pd);
    const dealFields = dealFieldsRequest.data;
    if (dealFieldsRequest.data === undefined){
        console.log("failed to fetch deals data")
        return false;
    }
    const quoteIssuedField = dealFields.find(f => f.name === "Quote issued");
    console.log("checking if field exists.....................................")
    if(quoteIssuedField === undefined) {
        console.log(`Could not find the "Quote issued" field on pipedrive`);
        return false;
    }
    console.log("updating deal.............")
    try{
        let res = await dealsApi.updateDeal(dealId, {
            [quoteIssuedField.key]: today()
        });
        if (res){
            console.log("updated deal")
        }else{
            console.log("error updating deal")
        }
    }catch(error){
        return false
    }
    // // Move the deal to the quote issued stage
    const stagesApi = new pipedrive.StagesApi(pd);
    const B2C_PIPELINE_ID = 23;
    let opts = {
        'pipelineId': B2C_PIPELINE_ID,
        'start': 0,
        'limit': 56
    };
    const stages = await stagesApi.getStages(opts);
    const quoteIssuedStage = stages.data.find(s => s.name === "Quote Issued");
    console.log("finding quote issued stage")
    if (quoteIssuedStage === undefined){
        console.log("failed to find quote issued stage")
        return false;
    }
    try{
        let response = await dealsApi.updateDeal(dealId, {
            stage_id: quoteIssuedStage.id
        });
        if (response){
            return true;
        }else{
            console.log("failed to move deal to stage");
            return false;
        }
    }catch(error){
        return false;
    }
}


function today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1.
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
import { SLACK_BOT_TOKEN } from "$env/static/private"
import { json } from '@sveltejs/kit';
const token = SLACK_BOT_TOKEN;

export async function getNewQuotes(quote){
    //send message to channel 
    const channel = "quotes";
    postToChannel(channel, quote);
}

export async function postToChannel(channel, payload) {
  const channelId = await channelNameToId(channel)
  const message = {
    channel: channelId,
    text: `new quote: \n <https://premiumlithium.pipedrive.com/deal/${payload[0][1]}|Deal>: <https://premiumlithium.pipedrive.com/organization/${payload[0][0]}|installer> quoted £${payload[0][2]} by ${payload[0][7]}`
  }

  try {
    const url = 'https://slack.com/api/chat.postMessage'
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    })
    const data = await response.json()

  } catch (err) {
    return json({ error: err});
  }
  return json({ ok: true});
}

async function channelNameToId(channelName) {
  let generalId
  let id

  try {
    const url = 'https://slack.com/api/conversations.list'
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json();

    data.channels.forEach((element) => {
      if (element.name === channelName) {
        id = element.id
      }
    })
    if (id) {
      return id
    } else return generalId
  } catch (err) {
  }
  return id
}

  
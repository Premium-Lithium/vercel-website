import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
    runtime: "edge"
}

// recieve a get request from vercel cron
// send all the emails needed

// need to look more into how vercel serverless functions interface with sveltekit

// first iteration will just construct the reprot and send it in the response body
// then requests will trigger an email
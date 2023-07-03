import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
    optimizeDeps: {exclute: ['svelte-mapbox']},
};

export default config;

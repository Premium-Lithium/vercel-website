import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// todo: fixes cross origin site error when calling `add-battery-finder-lead`, but not ideal
		// do we already have something to handle this?
		// csrf: {
		// 	checkOrigin: false,
		// }
	},
	vite: {
		optimizeDeps: {
			include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep']
		}
	}
};

export default config;

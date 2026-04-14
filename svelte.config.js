import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$server: 'src/lib/server',
			$stores: 'src/lib/stores',
			$types: 'src/lib/types',
			$utils: 'src/lib/utils'
		},
		// Apple OAuth envia o callback como POST de apple.com (form_post mode).
		// Liberamos só esta origem no CSRF check; demais POSTs cross-origin ficam bloqueados.
		csrf: {
			trustedOrigins: ['https://appleid.apple.com']
		}
	}
};

export default config;

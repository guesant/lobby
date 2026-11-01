import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    paths: {
      relative: false,
    },
    files: {
      assets: 'src/static',
    },
    adapter: adapter({
      pages: process.env.SITE_OUTPUT_DIR || '../.local/build/site',
      assets: process.env.SITE_OUTPUT_DIR || '../.local/build/site',
      strict: true,
    }),
    prerender: {
      handleHttpError: 'fail',
    },
  },
};

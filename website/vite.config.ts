import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

function outputDirectory(): string {
  const directory = process.env['SITE_OUTPUT_DIR'];

  if (!directory) {
    return '../.local/build/site';
  }

  return directory;
}

const directory = outputDirectory();

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      paths: {
        relative: false,
      },
      inlineStyleThreshold: 2048,
      adapter: adapter({
        pages: directory,
        assets: directory,
        strict: true,
      }),
      prerender: {
        handleHttpError: 'fail',
      },
    }),
  ],
  server: {
    port: 4173,
    strictPort: true,
  },
});

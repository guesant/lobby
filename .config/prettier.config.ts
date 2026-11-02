import * as multilineArraysPlugin from 'prettier-plugin-multiline-arrays';
import * as sveltePlugin from 'prettier-plugin-svelte';

export default {
  plugins: [
    sveltePlugin,
    multilineArraysPlugin,
  ],
  singleQuote: true,
  trailingComma: 'all',
  objectWrap: 'preserve',
  multilineArraysWrapThreshold: 0,
  overrides: [
    {
      files: '*.svelte',
      options: {
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
  ],
};

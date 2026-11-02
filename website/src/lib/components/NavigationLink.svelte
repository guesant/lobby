<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  const {
    href,
    rel,
    children,
    ...attributes
  }: Omit<HTMLAnchorAttributes, 'href'> & {
    href: string;
    children?: Snippet;
  } = $props();

  function internalPath(value: string): boolean {
    return value.startsWith('/') && !value.startsWith('//');
  }
</script>

{#if internalPath(href)}
  <a {...attributes} href={resolve(href.slice(1))} {rel}>
    {@render children?.()}
  </a>
{:else if href.startsWith('#')}
  <a {...attributes} href={'#' + href.slice(1)} {rel}>
    {@render children?.()}
  </a>
{:else if href.startsWith('https:')}
  <a {...attributes} href={'https:' + href.slice(6)} {rel}>
    {@render children?.()}
  </a>
{:else if href.startsWith('http:')}
  <a {...attributes} href={'http:' + href.slice(5)} {rel}>
    {@render children?.()}
  </a>
{:else}
  <a {...attributes} {href} rel="external {rel ?? ''}">
    {@render children?.()}
  </a>
{/if}

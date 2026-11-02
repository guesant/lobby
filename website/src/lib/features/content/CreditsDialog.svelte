<script lang="ts">
  import type { PageLoadData } from './content.types.ts';
  import { textOr } from './text.model.ts';
  import { dialogBackdrop, showDialog } from '#lib/browser/dialog.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const controls = interfaceState();

  const localized = $derived(data.localized);

  const credits = $derived(data.credits.entries);

  let creditsDialog = $state<HTMLDialogElement>();

  $effect((): void => {
    showDialog(creditsDialog, controls.dialog === 'credits');
  });
</script>

<dialog
  class="app-dialog credits-dialog"
  bind:this={creditsDialog}
  onclick={dialogBackdrop}
  onclose={(): void => {
    if (!creditsDialog?.open && controls.dialog === 'credits') {
      controls.dialog = 'none';
    }
  }}
  id="credits-dialog"
  data-credits-dialog
  aria-labelledby="credits-dialog-title"
  aria-describedby="credits-dialog-description"
>
  <div class="app-dialog-content credits-dialog-content">
    <header class="app-dialog-header credits-dialog-header">
      <div class="credits-dialog-heading">
        <h2 id="credits-dialog-title">
          {localized.ui['credits_dialog_title']}
        </h2>
        <p id="credits-dialog-description">
          {localized.ui['credits_dialog_description']}
        </p>
      </div>
      <form method="dialog">
        <button
          class="dialog-close"
          type="submit"
          data-dialog-close
          aria-label={localized.ui['credits_close']}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <div class="credits-list">
      {#each credits as credit (credit.id)}
        <section
          class="credit-entry"
          aria-labelledby="credit-{credit.id}-title"
        >
          <h3 id="credit-{credit.id}-title">{credit.name}</h3>
          <dl class="credit-entry-meta">
            <div>
              <dt>{localized.ui['credits_authors']}</dt>
              <dd>{credit.authors}</dd>
            </div>
            <div>
              <dt>{localized.ui['credits_license']}</dt>
              <dd>
                <NavigationLink
                  class="credit-license-link"
                  href={textOr(data.credits.licenses[credit.license]?.url, '#')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {textOr(
                    data.credits.licenses[credit.license]?.name,
                    credit.license,
                  )}
                </NavigationLink>
              </dd>
            </div>
          </dl>
          <details class="credit-license">
            <summary>{localized.ui['credits_license_text']}</summary>
            <pre>{data.credits.licenses[credit.license]?.text ?? ''}</pre>
          </details>
          <NavigationLink
            class="credit-official-link"
            href={credit.official_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {localized.ui['credits_official_url']}
          </NavigationLink>
        </section>
      {/each}
    </div>
  </div>
</dialog>

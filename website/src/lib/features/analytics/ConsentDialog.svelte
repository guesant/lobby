<script lang="ts">
  import { showDialog } from '../../browser/dialog.ts';
  import type { PageLoadData } from '../content/content.types.ts';
  import { interfaceState } from '../preferences/preferences.viewmodel.svelte.ts';
  import { measurementID } from './analytics.config.ts';
  import { createAnalyticsConsentController } from './analytics-consent.controller.ts';
  import { analyticsConsentDialogOpen } from './analytics-consent-dialog-open.model.ts';
  import { preventConsentDismissal } from './prevent-consent-dismissal.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import { onMount } from 'svelte';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const controls = interfaceState();

  const consent = createAnalyticsConsentController(controls);

  let dialog = $state<HTMLDialogElement | undefined>();

  const syncDialog = (): void => {
    const shouldOpen = analyticsConsentDialogOpen({
      measurementID,
      consent: controls.analyticsConsent,
      loaded: controls.analyticsConsentLoaded,
      dialog: controls.dialog,
    });

    showDialog(dialog, shouldOpen);
  };

  $effect(syncDialog);
  onMount(consent.restore);
</script>

<svelte:window onstorage={consent.restore} />

<dialog
  bind:this={dialog}
  class="app-dialog consent-dialog"
  id="analytics-consent-dialog"
  aria-labelledby="analytics-consent-title"
  aria-describedby="analytics-consent-description"
  oncancel={preventConsentDismissal}
>
  <div class="app-dialog-content consent-content">
    <header class="app-dialog-header">
      <h2 id="analytics-consent-title">
        <IconButton name="gear" />
        <span>{data.localized.ui['analytics_consent_title']}</span>
      </h2>
    </header>
    <p id="analytics-consent-description">
      {data.localized.ui['analytics_consent_description']}
    </p>
    <details class="consent-details">
      <summary>{data.localized.ui['analytics_consent_details']}</summary>
      <p>{data.localized.ui['analytics_consent_details_text']}</p>
    </details>
    <NavigationLink class="consent-privacy-link" href={data.privacyURL}>
      {data.localized.ui['privacy_policy']}
    </NavigationLink>
    <div class="consent-actions">
      <button
        type="button"
        class="ui-button"
        onclick={consent.set.bind(null, 'denied')}
      >
        {data.localized.ui['analytics_consent_reject']}
      </button>
      <button
        type="button"
        class="ui-button ui-button-primary"
        onclick={consent.set.bind(null, 'granted')}
      >
        {data.localized.ui['analytics_consent_accept']}
      </button>
    </div>
  </div>
</dialog>

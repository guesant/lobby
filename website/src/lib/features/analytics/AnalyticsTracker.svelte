<script lang="ts">
  import type { AnalyticsConsent } from '../preferences/preferences.types.ts';
  import { measurementID } from './analytics.config.ts';
  import { sendPageView } from './send-page-view.ts';
  import { updateGoogleConsent } from './update-google-consent.ts';

  const {
    consent,
    loaded,
    path,
  }: {
    consent: AnalyticsConsent;
    loaded: boolean;
    path: string;
  } = $props();

  let previousPath = $state('');

  const syncAnalytics = (): void => {
    if (!measurementID || !loaded) {
      return;
    }

    if (consent !== 'granted') {
      updateGoogleConsent('denied');
      previousPath = '';

      return;
    }

    if (path === previousPath) {
      return;
    }

    previousPath = path;
    sendPageView(measurementID, path);
  };

  $effect(syncAnalytics);
</script>

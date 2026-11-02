<script lang="ts">
  import { uptime } from './uptime/uptime.ts';

  const {
    birthDate,
    locale,
  }: {
    birthDate: string;
    locale: string;
  } = $props();
</script>

<time
  use:uptime={{
    birthDate,
    locale,
  }}
  datetime={birthDate}
  data-uptime={birthDate}
  data-uptime-locale={locale}
>
  {birthDate}
</time>

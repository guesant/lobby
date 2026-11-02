<script lang="ts">
  import { textOr } from './text.model.ts';
  import { elapsedParts } from '#lib/features/content/uptime.model.ts';
  import { onMount } from 'svelte';

  const {
    birthDate,
    locale,
  }: {
    birthDate: string;
    locale: string;
  } = $props();

  let date = $state<Date | null>(null);

  const formatted = $derived.by((): string => {
    if (!date) {
      return '';
    }

    const parts = elapsedParts(birthDate, date);

    return (
      [
        'years',
        'months',
        'days',
      ] as const
    )
      .map((unit): string => {
        const units = {
          years: 'year',
          months: 'month',
          days: 'day',
        };

        return new Intl.NumberFormat(locale, {
          style: 'unit',
          unit: units[unit],
          unitDisplay: 'long',
        })
          .format(parts[unit]);
      })
      .join(', ');
  });

  onMount((): (() => void) => {
    let timer: ReturnType<typeof setTimeout>;

    function update(): void {
      date = new Date();

      const midnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
      );

      timer = setTimeout(update, midnight.getTime() - date.getTime());
    }

    update();

    return (): void => {
      clearTimeout(timer);
    };
  });
</script>

<time datetime={birthDate} data-uptime={birthDate} data-uptime-locale={locale}>
  {textOr(formatted, birthDate)}
</time>

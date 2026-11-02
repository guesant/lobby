import { elapsedParts } from './uptime.model.ts';

export function formatUptime(
  birthDate: string,
  date: Date | null,
  locale: string,
): string {
  if (!date) {
    return '';
  }

  const parts = elapsedParts(birthDate, date);

  const units = [
    [
      'years',
      'year',
    ],
    [
      'months',
      'month',
    ],
    [
      'days',
      'day',
    ],
  ] as const;

  const formatted: string[] = [];

  for (const [
    field,
    unit,
  ] of units) {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'long',
    });

    const value = formatter.format(parts[field]);

    formatted.push(value);
  }

  return formatted.join(', ');
}

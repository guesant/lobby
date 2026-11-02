import type { UptimeParts } from './uptime.types.ts';
import { uptimeAnniversary } from './uptime-anniversary.model.ts';
import { uptimeMonthiversary } from './uptime-monthiversary.model.ts';
import { utcDate } from './utc-date.model.ts';

export function elapsedParts(birthDate: string, now: Date): UptimeParts {
  const [
    year = 0,
    month = 1,
    day = 1,
  ] = birthDate.split('-')
    .map(Number);

  const today = utcDate(now);

  const anniversary = uptimeAnniversary(
    {
      year,
      month,
      day,
    },
    today,
  );

  const monthiversary = uptimeMonthiversary(
    anniversary.anniversary,
    today,
    day,
  );

  const elapsedTime = today.getTime() - monthiversary.monthiversary.getTime();

  const days = elapsedTime / 86400000;

  return {
    years: anniversary.years,
    months: monthiversary.months,
    days,
  };
}

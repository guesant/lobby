import type { UptimeAnniversary } from './uptime.types.ts';

export function uptimeAnniversary(
  birthDate: {
    year: number;
    month: number;
    day: number;
  },
  today: Date,
): UptimeAnniversary {
  const birthYear = birthDate.year;

  const birthMonth = birthDate.month;

  const birthDay = birthDate.day;

  let years = today.getUTCFullYear() - birthYear;

  let anniversaryYear = birthYear + years;

  let timestamp = Date.UTC(anniversaryYear, birthMonth - 1, birthDay);

  let anniversary = new Date(timestamp);

  if (anniversary > today) {
    years -= 1;
    anniversaryYear = birthYear + years;
    timestamp = Date.UTC(anniversaryYear, birthMonth - 1, birthDay);
    anniversary = new Date(timestamp);
  }

  return {
    years,
    anniversary,
  };
}

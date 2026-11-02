import type { UptimeMonthiversary } from './uptime.types.ts';

export function uptimeMonthiversary(
  anniversary: Date,
  today: Date,
  birthDay: number,
): UptimeMonthiversary {
  let months =
    (today.getUTCFullYear() - anniversary.getUTCFullYear()) * 12 +
    today.getUTCMonth() -
    anniversary.getUTCMonth();

  let anniversaryYear = anniversary.getUTCFullYear();

  let anniversaryMonth = anniversary.getUTCMonth();

  let month = anniversaryMonth + months;

  let timestamp = Date.UTC(anniversaryYear, month, birthDay);

  let monthiversary = new Date(timestamp);

  if (monthiversary > today) {
    months -= 1;
    anniversaryYear = anniversary.getUTCFullYear();
    anniversaryMonth = anniversary.getUTCMonth();
    month = anniversaryMonth + months;
    timestamp = Date.UTC(anniversaryYear, month, birthDay);
    monthiversary = new Date(timestamp);
  }

  return {
    months,
    monthiversary,
  };
}

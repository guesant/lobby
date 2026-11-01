type UptimeUnit = 'years' | 'months' | 'days';

type UptimeParts = Record<UptimeUnit, number>;

export const elapsedParts = (birthDate: string, now: Date): UptimeParts => {
  const [
    year = 0,
    month = 1,
    day = 1,
  ] = birthDate.split('-')
    .map(Number);

  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  let years = today.getUTCFullYear() - year;

  let anniversary = new Date(Date.UTC(year + years, month - 1, day));

  if (anniversary > today) {
    years -= 1;
    anniversary = new Date(Date.UTC(year + years, month - 1, day));
  }

  let months =
    (today.getUTCFullYear() - anniversary.getUTCFullYear()) * 12 +
    today.getUTCMonth() -
    anniversary.getUTCMonth();

  let monthiversary = new Date(
    Date.UTC(
      anniversary.getUTCFullYear(),
      anniversary.getUTCMonth() + months,
      day,
    ),
  );

  if (monthiversary > today) {
    months -= 1;
    monthiversary = new Date(
      Date.UTC(
        anniversary.getUTCFullYear(),
        anniversary.getUTCMonth() + months,
        day,
      ),
    );
  }

  const days = (today.getTime() - monthiversary.getTime()) / 86400000;

  return {
    years,
    months,
    days,
  };
};

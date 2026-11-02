export function utcDate(date: Date): Date {
  const year = date.getFullYear();

  const month = date.getMonth();

  const day = date.getDate();

  const timestamp = Date.UTC(year, month, day);

  return new Date(timestamp);
}

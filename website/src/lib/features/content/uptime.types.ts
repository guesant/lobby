export type UptimeParts = Record<'years' | 'months' | 'days', number>;

export type UptimeAnniversary = {
  years: number;
  anniversary: Date;
};

export type UptimeMonthiversary = {
  months: number;
  monthiversary: Date;
};

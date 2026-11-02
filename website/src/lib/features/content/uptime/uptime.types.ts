export type UptimeProps = {
  birthDate: string;
  locale: string;
};

export type UptimeActionState = {
  element: HTMLTimeElement;
  props: UptimeProps;
  timer?: ReturnType<typeof setTimeout>;
};

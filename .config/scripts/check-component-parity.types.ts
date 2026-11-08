export type BadgeExpectation = {
  label: string;
  domains: string[];
};

export type ParityRoute = {
  path: string;
  language: string;
  id: string;
  expected: BadgeExpectation;
};

export type BadgeExpectation = {
  label: string;
  domains: string[];
};

export type ParityRoute = {
  path: string;
  language: string;
  minecraft: boolean;
  id: string;
  expected: BadgeExpectation;
};

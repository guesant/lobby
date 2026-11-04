export type BadgeExpectation = {
  label: string;
  domains: string[];
};

export type ParityRoute = {
  path: string;
  language: string;
  voxel: boolean;
  id: string;
  expected: BadgeExpectation;
};

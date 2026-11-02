export type BootState = {
  step: number;
  running: boolean;
};

export const bootModules = [
  'Navigation',
  'Content index',
  'User preferences',
  'Display controls',
];

export const bootSteps = 20;

export const bootInterval = 125;

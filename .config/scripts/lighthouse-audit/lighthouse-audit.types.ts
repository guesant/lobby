export type FormFactor = 'mobile' | 'desktop';

export type LighthouseResult = {
  path: string;
  formFactor: FormFactor;
  scores: Record<string, number>;
};

import type { LaunchOptions, Viewport } from 'puppeteer-core';

export type AccessibilityAudit = {
  url: string;
  actions?: string[];
  rootElement?: string;
  viewport?: Viewport;
};

export type AccessibilityDefaults = {
  chromeLaunchConfig: LaunchOptions;
  viewport: Viewport;
};

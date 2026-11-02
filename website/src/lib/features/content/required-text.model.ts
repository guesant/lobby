import { assertText } from './assert-text.model.ts';

export function requiredText(value: unknown, label: string): string {
  assertText(value, label);

  return value;
}

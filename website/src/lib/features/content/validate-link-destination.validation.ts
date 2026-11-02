import { requiredText } from './validation.model.ts';

export function validateLinkDestination(value: string, label: string): void {
  requiredText(value, label);

  if (/^\s*(javascript|data|vbscript):/i.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

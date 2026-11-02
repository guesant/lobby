import { array } from './array.model.ts';
import { assertText } from './assert-text.model.ts';

export function strings(value: unknown, label: string): string[] {
  const items = array(value, label);

  const output: string[] = [];

  for (const [
    index,
    entry,
  ] of items.entries()) {
    const entryLabel = `${label}[${String(index)}]`;

    assertText(entry, entryLabel);
    output.push(entry);
  }

  return output;
}

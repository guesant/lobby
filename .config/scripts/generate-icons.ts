import { generateIcons } from './generate-icons/generate-icons.ts';

if (import.meta.main) {
  await generateIcons();
}

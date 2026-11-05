import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '..',
  test: {
    environment: 'node',
    fileParallelism: true,
    include: [
      '.config/scripts/*.test.ts',
    ],
    setupFiles: [
      '.config/vitest.setup.ts',
    ],
    maxWorkers: 2,
  },
});

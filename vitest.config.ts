import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '**/dist'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['design/components/**', 'packages/*/src/**'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/index.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});

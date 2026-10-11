import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@page': fromRoot('./src/pages'),
      '@component': fromRoot('./src/components'),
      '@hook': fromRoot('./src/hooks'),
      '@game': fromRoot('./src/game'),
      '@context': fromRoot('./src/contexts'),
      '@test': fromRoot('./src/test'),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'game',
          environment: 'node',
          include: ['src/game/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          setupFiles: ['./src/testSetup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/game/**'],
        },
      },
    ],
  },
});

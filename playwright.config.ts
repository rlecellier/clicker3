import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 480, height: 560 }, hasTouch: true },
    },
    // Petit Android : on ne rejoue que le parcours d'une vie (navigation dans
    // tous les onglets, sans défilement horizontal), sans dupliquer les autres.
    {
      name: 'petit-mobile',
      testMatch: 'life.e2e.ts',
      use: { viewport: { width: 360, height: 640 }, hasTouch: true },
    },
  ],
  webServer: {
    command: `${process.env.SKIP_BUILD ? '' : 'npm run build && '}npm run preview -- --port 4173 --strictPort`,
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});

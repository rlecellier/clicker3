// Joue une vie avec le joueur virtuel et affiche la courbe (npm run sim).
// Option : --csv pour la courbe complète au format CSV.
import { createServer } from 'vite';

const server = await createServer({
  configFile: 'vite.config.ts',
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});
try {
  const simulator = await server.ssrLoadModule('/src/game/simulator/index.ts');
  const result = simulator.simulateLife();
  console.log(
    process.argv.includes('--csv')
      ? simulator.formatCsv(result)
      : simulator.formatReport(result),
  );
} finally {
  await server.close();
}

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
  if (process.argv.includes('--csv')) {
    console.log(simulator.formatCsv(result));
  } else {
    console.log(simulator.formatReport(result));
    console.log('');
    console.log(
      simulator.formatGuardrails(
        simulator.runGuardrails(result),
        simulator.knownGuardrailFailures,
      ),
    );
  }
} finally {
  await server.close();
}

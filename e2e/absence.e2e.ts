import { expect, test } from '@playwright/test';
import type { GameState } from '@game/state';
import { expectNoOverflow, preloadSave } from './helpers';

const MINUTE_MS = 60_000;
const MONTH_MS = 30 * 24 * 60 * MINUTE_MS;

const automatedLife: Partial<GameState> = {
  phase: 'boss',
  upgrades: ['procedure-travail'],
  autoWork: true,
  money: 1000,
};

test('absence : le travail automatique avance pendant la fermeture', async ({
  page,
}) => {
  // Dix minutes d'absence : l'écran d'absence passe avant le jeu.
  await preloadSave(page, { state: automatedLife, absenceMs: 10 * MINUTE_MS });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/absence');
  await expect(
    page.getByRole('heading', { name: 'Pendant votre absence' }),
  ).toBeVisible();
  await expect(page.getByText('Temps écoulé')).toBeVisible();
  await expect(page.getByText(/\d+ périodes?/).first()).toBeVisible();
  await expect(page.getByText('Réputation', { exact: true })).toBeVisible();
  await expectNoOverflow(page);

  // Fermer l'écran reprend la partie, interrupteur toujours activé.
  await page.getByRole('button', { name: 'Reprendre ma vie' }).click();
  await expect(page).toHaveURL('/jeu');
  await expect(
    page.getByText('Appui long : couper l’automatique'),
  ).toBeVisible();

  // Rouvrir tout de suite la partie ne rattrape rien.
  await page.reload();
  await expect(page).toHaveURL('/jeu');

  // Une absence qui dépasse la vie mène au bilan, via l'écran d'absence.
  await preloadSave(page, { state: automatedLife, absenceMs: 40 * MONTH_MS });
  await page.goto('/');
  await page.getByRole('link', { name: 'Reprendre' }).click();
  await expect(page).toHaveURL('/absence');
  await page.getByRole('button', { name: 'Voir le bilan' }).click();
  await expect(page).toHaveURL('/fin');
  await expect(page.getByRole('heading', { name: 'You died' })).toBeVisible();
});

import { expect, test } from '@playwright/test';
import { actionRules, startState } from '@game/data';
import type { GameState } from '@game/state';
import { numberOf, openTab, preloadSave } from './helpers';

const { overtimeActions } = actionRules.work.promotion;
const jobId = startState.jobId ?? '';

// À une action de la promotion `rank` : la journée est faite (30 de jauge de
// travail), le prochain clic est payé en heures sup. et atteint le seuil.
const beforePromotion = (rank: number): Partial<GameState> => ({
  overtimeActions: { [jobId]: (overtimeActions[rank] ?? 0) - 1 },
  promotionsOffered: { [jobId]: rank },
  gauge: 40,
  gaugeSegments: [{ kind: 'work', amount: 40 }],
  mailRead: 0,
});

test('promotion : le jeu s’arrête, on accepte puis on refuse', async ({
  page,
}) => {
  await preloadSave(page, { state: beforePromotion(0) });
  await page.goto('/jeu/vie');
  const work = page.getByRole('button', { name: /Travailler/ });
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeHidden();

  // Le clic qui atteint le seuil arrête le jeu : aucune popup de courrier, mais
  // une fenêtre qui demande une réponse.
  await work.tap();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Promotion (1/3)');
  await expect(page.getByText('Nouveau message')).toBeHidden();
  const detail = (await dialog.getByText(/par action/).textContent()) ?? '';
  const announced = numberOf(detail.split('→', 2)[1]);

  // Accepter : le salaire affiché est celui que rapporte ensuite le travail.
  await dialog.getByRole('button', { name: 'Accepter' }).tap();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`Rapporte ${announced}`)).toBeVisible();
  await openTab(page, 'courrier');
  await expect(
    page.getByText('Vous avez accepté la promotion', { exact: false }),
  ).toBeVisible();

  // Deuxième promotion, refusée : rien ne change.
  const second = await page.context().newPage();
  await preloadSave(second, { state: beforePromotion(1) });
  await second.goto('/jeu/vie');
  const secondWork = second.getByRole('button', { name: /Travailler/ });
  await secondWork.tap();
  const secondDialog = second.getByRole('alertdialog');
  await expect(secondDialog).toContainText('Promotion (2/3)');
  await secondDialog.getByRole('button', { name: 'Refuser' }).tap();
  await expect(secondDialog).toBeHidden();
  await openTab(second, 'courrier');
  await expect(
    second.getByText('Vous avez refusé la promotion', { exact: false }),
  ).toBeVisible();
});

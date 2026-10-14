import { expect, test } from '@playwright/test';
import { childEvents, startState } from '@game/data';
import { expectNoOverflow, preloadSave } from './helpers';

// Un enfant de 4 ans : il peut fouiller et réclamer, et plus aucun événement
// ne l'interrompt (ils sont déjà vécus).
const fourYearsOld = {
  lifeSlice: 'earlyChildhood' as const,
  growth: 160,
  child: {
    ...startState.child,
    quarter: 16,
    objects: ['teddy'],
    attention: 100,
    firedEvents: childEvents.map(({ id }) => id),
  },
};

test('petite enfance : fouiller, réclamer, mettre en favori et jouer, au toucher', async ({
  page,
}) => {
  await preloadSave(page, { state: fourYearsOld });
  await page.goto('/jeu/maison');
  await expect(page.getByRole('heading', { name: 'Maison' })).toBeVisible();
  await expectNoOverflow(page);

  // Les sorties et les demandes sont dans la Maison, avec les activités.
  await expect(page.getByText('Fouille : 0 sur 5')).toHaveCount(2);
  await expect(page.getByText('Réclamer un jeu de logique')).toBeVisible();
  await expect(page.getByText('Coûte 40 d’Attention.').first()).toBeVisible();

  // Fouiller la maison cinq fois rend un objet, dont l'activité s'ajoute.
  const home = page.getByRole('listitem').filter({
    hasText: 'Fouiller la maison',
  });
  const explore = home.getByRole('button', { name: 'Explorer' });
  for (let index = 0; index < 5; index += 1) {
    await explore.tap();
  }
  await expect(home).toContainText('Fouille : 0 sur 5');
  await expect(
    page.getByText(
      /Lécher le pot de confiture|Taper sur les casseroles|Appuyer sur tous les boutons|Marcher dans les chaussures/,
    ),
  ).toBeVisible();

  // Réclamer à des parents qui ont les moyens : la réponse s'affiche, l'objet arrive.
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Réclamer un jeu de logique' })
    .getByRole('button', { name: 'Demander' })
    .tap();
  await expect(page.getByRole('status')).toContainText('« Oui. »');
  await expect(page.getByText('Résoudre le jeu de logique')).toBeVisible();

  // Mettre « Explorer dehors » en favori, puis le retrouver sur la Vie.
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Explorer dehors' })
    .getByRole('button', { name: '☆ Favori' })
    .tap();
  await page
    .getByRole('navigation', { name: 'Navigation du jeu' })
    .getByRole('link', { name: 'Vie' })
    .tap();
  const outside = page.getByRole('button', { name: 'Explorer dehors' });
  await expect(outside).toBeVisible();
  await expect(page.getByText('Fouille : 0 sur 5')).toBeVisible();
  await outside.tap();
  await expect(page.getByText('Fouille : 1 sur 5')).toBeVisible();
  await expect(page.getByLabel('Attention des parents')).toBeVisible();
  await expectNoOverflow(page);
});

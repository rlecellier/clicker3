import { expect, test } from '@playwright/test';
import { childEvents, startState } from '@game/data';
import { initialRelations } from '@game/relations';
import { expectNoOverflow, preloadSave } from './helpers';

// Un enfant de 4 ans : il peut fouiller et réclamer, et plus aucun événement
// ne l'interrompt (ils sont déjà vécus).
const fourYearsOld = {
  lifeSlice: 'earlyChildhood' as const,
  growth: 160,
  // Maman est assez proche pour jouer avec ; un copain est déjà là.
  relations: [
    ...initialRelations('standard').map((relation) =>
      relation.id === 'mother' ? { ...relation, bond: 30 } : relation,
    ),
    {
      id: 'friend',
      name: 'Noa',
      role: 'ami',
      kind: 'friend' as const,
      bond: 12,
    },
  ],
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

  // Relations : la famille d'abord, le copain dans un second onglet ; jouer
  // avec Maman (une activité qui s'ouvre au lien 25) renforce le lien.
  const sidebar = page.getByRole('navigation', { name: 'Navigation du jeu' });
  await sidebar.getByRole('link', { name: 'Relations' }).tap();
  await expect(page).toHaveURL('/jeu/relations');
  await expect(page.getByText('Lien : 30 sur 100')).toBeVisible();
  await expect(page.getByText('Maman (mère)')).toBeVisible();
  await page.getByRole('tab', { name: 'Amis' }).tap();
  await expect(page.getByText('Noa (ami)')).toBeVisible();
  await expect(page.getByText('Lien : 12 sur 100')).toBeVisible();
  await sidebar.getByRole('link', { name: 'Maison' }).tap();
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Jouer avec Maman' })
    .getByRole('button', { name: 'Jouer' })
    .tap();
  await sidebar.getByRole('link', { name: 'Relations' }).tap();
  await expect(page.getByText('Lien : 32 sur 100')).toBeVisible();
  await expectNoOverflow(page);
});

test('petite enfance : une vie de 0 à 6 ans au toucher, du choix de la famille à l’Enfance', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Petite enfance/ }).tap();
  await page.getByRole('button', { name: 'Famille standard' }).tap();
  await expect(page).toHaveURL('/jeu/vie');

  // Le joueur gazouille, et répond au premier choix de chaque événement, jusqu'au bilan.
  const babble = page.getByRole('button', { name: 'Gazouiller' });
  const prompt = page.getByRole('alertdialog');
  const report = page.getByRole('heading', { name: 'Carnet de santé' });
  for (let step = 0; step < 800 && (await report.count()) === 0; step += 1) {
    if ((await prompt.count()) > 0) {
      await prompt.getByRole('button').first().tap();
    } else {
      await babble.tap();
    }
  }
  await expect(report).toBeVisible();
  // Entre 4 et 7 événements, le premier mot et le premier copain compris.
  // Le chiffre du carnet fait foi : un tap trop vite après l'ouverture d'une
  // fenêtre est ignoré, donc le nombre de taps ne compte pas les événements.
  const lived = Number(
    await page
      .getByText('Événements vécus')
      .locator('xpath=following-sibling::dd[1]')
      .textContent(),
  );
  expect(lived).toBeGreaterThanOrEqual(4);
  expect(lived).toBeLessThanOrEqual(7);
  await expect(page.getByText('Énergie')).toBeVisible();
  await expect(page.getByText('Maman (mère)')).toBeVisible();
  await expect(page.getByText('Noa (ami)')).toBeVisible();
  await expectNoOverflow(page);

  // Entrer en Enfance : les traits et le caractère sont rappelés.
  await page.getByRole('button', { name: 'Entrer en Enfance' }).tap();
  await expect(page.getByRole('heading', { name: 'Enfance' })).toBeVisible();
  await expect(page.getByText('Hérité de la petite enfance :')).toBeVisible();
  await expect(page.getByText('Énergie')).toBeVisible();
  await page.getByRole('button', { name: 'Jouer' }).tap();
  await expect(
    page
      .getByText('Curiosité', { exact: true })
      .locator('xpath=following-sibling::dd[1]'),
  ).toHaveText('1');
  await expectNoOverflow(page);
});

test('petite enfance : une autre famille change le départ', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Petite enfance/ }).tap();

  // Les familles sont proposées avec leur description.
  await expect(
    page.getByText('Dans quelle famille naissez-vous ?'),
  ).toBeVisible();
  for (const name of [
    'Famille standard',
    'Fils ou fille de millionnaire',
    'Fils ou fille de star du rock',
    'Sans domicile fixe',
    'Parents enseignants',
    'Ferme familiale',
  ]) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  await expectNoOverflow(page);

  // Un enfant de millionnaire naît avec des jouets (la Maison est ouverte dès
  // le départ) et des parents au lien timide.
  await page
    .getByRole('button', { name: 'Fils ou fille de millionnaire' })
    .tap();
  const bar = page.getByRole('navigation', { name: 'Navigation du jeu' });
  await expect(bar.getByRole('link', { name: 'Maison' })).toBeVisible();
  await bar.getByRole('link', { name: 'Maison' }).tap();
  await expect(page.getByText('Câliner le nounours')).toBeVisible();
  await expect(page.getByText('Empiler les cubes')).toBeVisible();
  await bar.getByRole('link', { name: 'Relations' }).tap();
  await expect(page.getByText('Lien : 12 sur 100').first()).toBeVisible();
  await expect(page.getByText('Papa (père)')).toBeVisible();
});

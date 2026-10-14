import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectNoOverflow } from './game';

// Onglets de l'écran de jeu : slug de la route `/jeu/<slug>` et libellé de la
// sidebar (voir ADR 0008).
const tabLabels = {
  courrier: 'Courrier',
  vie: 'Vie',
  profil: 'Profil',
  emploi: 'Emploi',
  entreprises: 'Entreprises',
  ameliorations: 'Améliorations',
  comptes: 'Comptes',
  finance: 'Finance',
  ville: 'Ville',
} as const;

export type TabSlug = keyof typeof tabLabels;

// Nom accessible d'un onglet : le libellé, éventuellement suivi d'une précision
// (« Courrier, 3 messages non lus »).
const tabName = (slug: TabSlug) => new RegExp(`^${tabLabels[slug]}(,|$)`);

// Ouvre un onglet au toucher, comme le ferait le joueur (le jeu se joue surtout
// sur mobile : les projets Playwright ont `hasTouch`). À 480 px, la barre des
// tâches épingle quelques onglets ; les autres passent par le menu Démarrer.
// Vérifie que l'URL le reflète et que l'onglet ne déborde pas de l'écran (pas
// de défilement horizontal, à 480 px comme à 360 px).
export const openTab = async (page: Page, slug: TabSlug) => {
  const pinned = page
    .getByRole('navigation', { name: 'Navigation du jeu' })
    .getByRole('link', { name: tabName(slug) });
  if ((await pinned.count()) > 0) {
    await pinned.tap();
  } else {
    await page.getByRole('button', { name: /^Démarrer/ }).tap();
    await page
      .getByRole('navigation', { name: 'Menu Démarrer' })
      .getByRole('link', { name: tabName(slug) })
      .tap();
  }
  await expect(page).toHaveURL(`/jeu/${slug}`);
  await expectNoOverflow(page);
};

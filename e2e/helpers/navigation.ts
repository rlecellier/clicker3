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

// Ouvre un onglet par la sidebar, au toucher comme le ferait le joueur (le jeu
// se joue surtout sur mobile : les projets Playwright ont `hasTouch`), et vérifie que
// l'URL le reflète et que l'onglet ne déborde pas de l'écran (pas de
// défilement horizontal, à 480 px comme à 360 px).
export const openTab = async (page: Page, slug: TabSlug) => {
  await page
    .getByRole('navigation', { name: 'Navigation du jeu' })
    .getByRole('link', { name: tabName(slug) })
    .tap();
  await expect(page).toHaveURL(`/jeu/${slug}`);
  await expectNoOverflow(page);
};

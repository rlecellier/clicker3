import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Onglets de l'écran de jeu : slug de la route `/jeu/<slug>` et libellé de la
// sidebar (voir ADR 0008).
const tabLabels = {
  courrier: 'Courrier',
  vie: 'Vie',
  competences: 'Compétences',
  emploi: 'Emploi',
  investir: 'Investir',
  comptes: 'Comptes',
  ville: 'Ville',
} as const;

export type TabSlug = keyof typeof tabLabels;

// Ouvre un onglet par la sidebar, comme le ferait le joueur, et vérifie que
// l'URL le reflète.
export const openTab = async (page: Page, slug: TabSlug) => {
  await page
    .getByRole('navigation', { name: 'Navigation du jeu' })
    .getByRole('link', { name: tabLabels[slug], exact: true })
    .click();
  await expect(page).toHaveURL(`/jeu/${slug}`);
};

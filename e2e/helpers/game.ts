import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { LONG_PRESS_MS } from '@hook/useHoldRepeat';

// Valeur affichée d'un compteur de la page de jeu (« Argent », « Stock »…).
export const counter = (page: Page, label: string): Locator =>
  page
    .getByText(label, { exact: true })
    .locator('xpath=following-sibling::dd[1]');

// Nombre d'un texte formaté (« 1 250 € », « 0,3 »), espaces insécables
// comprises. Ne lit que le premier nombre (« 3 / 50 » donne 3).
const numberPattern = /-?\d[\d\s\u{202F}\u{A0}]*(?:,\d+)?/u;
const spacePattern = /[\s\u{202F}\u{A0}]/gu;

export const numberOf = (text = ''): number => {
  const match = numberPattern.exec(text);
  return match === null
    ? NaN
    : Number(match[0].replaceAll(spacePattern, '').replace(',', '.'));
};

export const amountOf = async (locator: Locator) =>
  numberOf(
    (await locator.getAttribute('title')) ??
      (await locator.textContent()) ??
      undefined,
  );

// Ligne d'une liste (emploi, entreprise, amélioration, quartier) par son titre.
export const itemOf = (page: Page, title: string | RegExp): Locator =>
  page.getByRole('listitem').filter({ hasText: title });

// Joue `action` jusqu'à ce que `isDone` soit vrai (au plus `max` fois) : le
// hasard des marqueurs (graine fixe) ne permet pas de compter les clics.
export const repeatUntil = async (
  action: () => Promise<void>,
  isDone: () => Promise<boolean>,
  max = 80,
) => {
  for (let turn = 0; turn < max; turn += 1) {
    if (await isDone()) {
      return;
    }
    await action();
  }
  expect(await isDone(), `condition non atteinte en ${max} tours`).toBe(true);
};

export const expectNoOverflow = async (page: Page) => {
  const isOverflowing = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(isOverflowing).toBe(false);
};

// Appui long sur un bouton (horloge simulée par `page.clock.install()`).
export const longPress = async (page: Page, target: Locator) => {
  await target.hover();
  await page.mouse.down();
  await page.clock.runFor(LONG_PRESS_MS + 100);
  await page.mouse.up();
};

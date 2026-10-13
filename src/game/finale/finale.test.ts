import { startState, upgrades } from '@game/data';
import {
  acknowledgeFinalUpgrade,
  FINAL_UPGRADE_ID,
  isFinalUpgradePending,
} from './finale';

describe('FINAL_UPGRADE_ID', () => {
  it('désigne la plus chère des améliorations : le Marketplace à 2 milliards', () => {
    const [priciest] = upgrades.toSorted(
      (first, second) => second.price - first.price,
    );
    expect(priciest?.id).toBe(FINAL_UPGRADE_ID);
    expect(priciest?.price).toBe(2_000_000_000);
  });
});

describe('isFinalUpgradePending', () => {
  it('attend le joueur une fois la dernière amélioration achetée', () => {
    expect(isFinalUpgradePending(startState)).toBe(false);
    const bought = { ...startState, upgrades: [FINAL_UPGRADE_ID] };
    expect(isFinalUpgradePending(bought)).toBe(true);
  });

  it('ne revient plus une fois acquittée', () => {
    const bought = { ...startState, upgrades: [FINAL_UPGRADE_ID] };
    expect(isFinalUpgradePending(acknowledgeFinalUpgrade(bought))).toBe(false);
  });
});

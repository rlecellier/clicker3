import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { canBuyCompany, companyCost, ownedCount } from '@game/companies';
import { companies, districts, upgrades } from '@game/data';
import type { Company, Upgrade } from '@game/data';
import { canUnlockDistrict } from '@game/districts';
import { describeRequirement, formatCount, formatMoney } from '@game/format';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import type { GameState } from '@game/state';
import { canBuyUpgrade, isOwned } from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';

export type UpgradeGroup = { id: string; caption: string; items: ListItem[] };

const categories = [
  { id: 'courses', caption: 'Formations' },
  { id: 'housing', caption: 'Logement' },
  { id: 'storage', caption: 'Entrepôt et marqueurs' },
  { id: 'staff', caption: 'Employés' },
  { id: 'automation', caption: 'Automatisations' },
  { id: 'gear', caption: 'Matériel et réputation' },
] as const;

type CategoryId = (typeof categories)[number]['id'];

// Catégorie d'une amélioration : celle du premier de ses effets qui en désigne une.
const effectCategories: Record<string, CategoryId> = {
  course: 'courses',
  housing: 'housing',
  stockCapacity: 'storage',
  maxMarkers: 'storage',
  employee: 'staff',
  automation: 'automation',
  dashboard: 'automation',
};

const categoryOf = (upgrade: Upgrade): CategoryId =>
  upgrade.effects
    .map((effect) => effectCategories[effect.type])
    .find((category) => category !== undefined) ?? 'gear';

// Ce qui manque pour débloquer, sinon rien.
const missing = (state: GameState, requirement?: Requirement) =>
  requirement !== undefined && !isUnlocked(state, requirement)
    ? describeRequirement(requirement)
    : undefined;

// Pourquoi l'achat est impossible : rien si déjà fait, sinon la fin de partie,
// le déblocage manquant ou, à défaut, le manque de ressource.
const reasonOf = (
  state: GameState,
  isDone: boolean,
  requirement: Requirement | undefined,
  shortage: string,
) => {
  if (isDone) {
    return;
  }
  return state.status === 'dead'
    ? 'Partie terminée'
    : (missing(state, requirement) ?? shortage);
};

const stockLabel = (state: GameState) => {
  if (state.lastStatement?.stockout === true) {
    return 'en rupture';
  }
  if (state.stock >= state.stockCapacity) {
    return 'plein';
  }
  return state.stock === 0 ? 'vide' : 'en cours';
};

const companyEffect = (company: Company) =>
  company.kind === 'production'
    ? `Produit ${formatCount(company.output)} articles par période`
    : `Vend jusqu’à ${formatCount(company.capacity)} articles à ${formatMoney(company.price)}`;

// Achats d'entreprises, d'améliorations et déblocage de quartiers.
export const useInvestScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

  const companyItems: ListItem[] = companies.map((company) => {
    const owned = ownedCount(state, company.id);
    const cost = companyCost(company.id, owned);
    const canBuy = canBuyCompany(state, company.id);
    return {
      id: company.id,
      title: company.name,
      badge: owned > 0 ? `${formatCount(owned)} possédé(s)` : undefined,
      detail: `${company.kind === 'production' ? 'Production' : 'Commerce'} · ${companyEffect(company)} · prochain : ${formatMoney(cost)}`,
      actionLabel: 'Acheter',
      isDisabled: !canBuy,
      reason: reasonOf(state, false, company.requirement, 'Argent insuffisant'),
      onAction: () => {
        actions.buyCompany(company.id);
      },
    };
  });

  const upgradeGroups: UpgradeGroup[] = categories.map((category) => ({
    ...category,
    items: upgrades
      .filter((upgrade) => categoryOf(upgrade) === category.id)
      .map((upgrade) => {
        const isBought = isOwned(state, upgrade.id);
        const extra = [
          upgrade.rent === undefined
            ? undefined
            : `loyer +${formatMoney(upgrade.rent)}`,
          upgrade.payroll === undefined
            ? undefined
            : `salaires +${formatMoney(upgrade.payroll)}`,
        ].filter((part) => part !== undefined);
        return {
          id: upgrade.id,
          title: upgrade.name,
          badge: isBought ? 'Acheté' : undefined,
          detail: [
            upgrade.description,
            formatMoney(upgrade.price),
            ...extra,
          ].join(' · '),
          actionLabel: isBought ? 'Acheté' : 'Acheter',
          isDisabled: !canBuyUpgrade(state, upgrade.id),
          reason: reasonOf(
            state,
            isBought,
            upgrade.requirement,
            'Argent insuffisant',
          ),
          onAction: () => {
            actions.buyUpgrade(upgrade.id);
          },
        };
      }),
  }));

  const districtItems: ListItem[] = districts.map((district) => {
    const isOpen = state.districts.includes(district.id);
    return {
      id: district.id,
      title: district.name,
      badge: isOpen ? 'Ouvert' : undefined,
      detail: `${district.description} · ${formatCount(district.cost)} de réputation`,
      actionLabel: isOpen ? 'Ouvert' : 'Débloquer',
      isDisabled: !canUnlockDistrict(state, district.id),
      reason: reasonOf(
        state,
        isOpen,
        district.requirement,
        'Réputation insuffisante',
      ),
      onAction: () => {
        actions.unlockDistrict(district.id);
      },
    };
  });

  return {
    stock: {
      label: `Entrepôt : ${stockLabel(state)} (${formatCount(state.stock)} / ${formatCount(state.stockCapacity)})`,
      value: state.stock,
      max: state.stockCapacity,
    },
    companies: companyItems,
    upgradeGroups,
    districts: districtItems,
  };
};
